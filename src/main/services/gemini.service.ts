import OpenAI from 'openai';
import { WordMeaningResponse, BatchWordResult, ParsedWord } from '../../shared/types';
import { formatPartOfSpeech } from '../../shared/utils/wordParser';

class AIService {
  private client: OpenAI | null = null;

  setApiKey(apiKey: string): void {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.proxyapi.ru/openai/v1'
    });
  }

  private ensureInitialized(): void {
    if (!this.client) {
      throw new Error('API key not set. Please configure API key in settings.');
    }
  }

  /**
   * Generates cards for multiple words in a single request (batch)
   * Returns results grouped by word
   * Accepts parsed words with part of speech constraints
   */
  async generateWordMeaningsBatch(parsedWords: ParsedWord[], examplesPerMeaning: number): Promise<BatchWordResult[]> {
    this.ensureInitialized();

    const wordsList = parsedWords.map((pw, i) =>
      `${i + 1}. "${pw.word}" (${formatPartOfSpeech(pw.partOfSpeech)})`
    ).join('\n');

    const prompt = `You are an expert lexicographer creating Anki flashcards for ESL students (English as a Second Language).

TASK: For EACH word below, generate 1-2 MAIN meanings only. Follow the part of speech constraint if specified.

WORDS:
${wordsList}

RULES:
1. **Meaning Limit**: Generate only 1-2 most common/important meanings per word. Focus on the most frequently used definitions.
2. **Part of Speech Constraint**:
   - If "(verb only)" is specified, generate ONLY verb definitions.
   - If "(noun only)" is specified, generate ONLY noun definitions.
   - If "(any part of speech)" is specified, generate the 1-2 most common meanings regardless of word type.
3. **Simple Vocabulary (Critical)**: Write definitions using ONLY words from the 'Longman Defining Vocabulary' (A1-B1 level). If you must use a harder word, explain it simply.
4. **COBUILD Style**: Use full sentence definitions (e.g., "If you <b>run</b>, you move very quickly using your legs.")
5. **Clarity Check**: The definition must be EASIER to understand than the target word itself.
6. **Bold Target Word**: Wrap the target word (or its form) with <b></b> tags in BOTH the definition AND the example sentences.
7. **Additional Examples**: Provide ${examplesPerMeaning} more examples for the SAME meaning.

Respond with a JSON array where each object represents ONE word with its meanings:
[
  {
    "word": "run",
    "meanings": [
      {
        "wordType": "verb",
        "definition": "If you <b>run</b>, you move very quickly by moving your legs faster than when you walk.",
        "definitionExample": "I <b>run</b> every morning to stay healthy.",
        "exampleType": "run",
        "examples": ["She <b>runs</b> faster than anyone.", "The children were <b>running</b>."],
        "transcription": "rʌn"
      }
    ]
  },
  {
    "word": "book",
    "meanings": [
      {
        "wordType": "noun",
        "definition": "A <b>book</b> is a number of pages of text held together in a cover.",
        "definitionExample": "I'm reading a <b>book</b> about history.",
        "exampleType": "book",
        "examples": ["She bought a new <b>book</b>.", "This <b>book</b> is very interesting."],
        "transcription": "bʊk"
      }
    ]
  }
]

IMPORTANT:
- Process ALL ${parsedWords.length} words
- Generate ONLY 1-2 meanings per word (not more!)
- Strictly follow part of speech constraints when specified
- Skip rare or archaic meanings
- Respond with ONLY the JSON array, no other text`;

    try {
      const completion = await this.client!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });

      const text = completion.choices[0]?.message?.content || '';

      // Try to parse JSON array from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      const parsed = JSON.parse(jsonMatch[0]) as any[];

      // Process and validate each word's results
      return parsed.map((wordResult: any) => ({
        word: wordResult.word || '',
        meanings: (wordResult.meanings || []).map((meaning: any) => ({
          wordType: meaning.wordType || '',
          definition: meaning.definition || '',
          definitionExample: meaning.definitionExample || '',
          exampleType: meaning.exampleType || '',
          examples: meaning.examples || [],
          transcription: (meaning.transcription || '').replace(/\//g, '').trim()
        }))
      }));
    } catch (error: any) {
      console.error('AI batch word meanings error:', error);
      throw new Error(`Failed to generate word meanings: ${error.message}`);
    }
  }
}

export const geminiService = new AIService();
