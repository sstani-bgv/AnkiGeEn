import OpenAI from 'openai';
import { WordMeaningResponse, BatchWordResult } from '../../shared/types';

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
   */
  async generateWordMeaningsBatch(words: string[], examplesPerMeaning: number): Promise<BatchWordResult[]> {
    this.ensureInitialized();

    const wordsList = words.map((w, i) => `${i + 1}. "${w}"`).join('\n');

    const prompt = `You are an expert lexicographer creating Anki flashcards for ESL students (English as a Second Language).

TASK: For EACH of the following words, identify ALL distinct common meanings and create a separate entry for each meaning.

WORDS:
${wordsList}

RULES:
1. **Multiple Meanings**: If a word has several common meanings (e.g., "run" as verb "to move fast" vs "to manage" vs noun "a jog"), create a SEPARATE entry for EACH meaning.
2. **Simple Vocabulary (Critical)**: Write definitions using ONLY words from the 'Longman Defining Vocabulary' (A1-B1 level). If you must use a harder word, explain it simply.
3. **COBUILD Style**: Use full sentence definitions (e.g., "If you <b>run</b>, you move very quickly using your legs.")
4. **Clarity Check**: The definition must be EASIER to understand than the target word itself.
5. **Bold Target Word**: Wrap the target word (or its form) with <b></b> tags in BOTH the definition AND the example sentences.
6. **Additional Examples**: Provide ${examplesPerMeaning} more examples for the SAME meaning.

Respond with a JSON array where each object represents ONE word with all its meanings:
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
      },
      {
        "wordType": "verb",
        "definition": "If you <b>run</b> a business or organization, you are in charge of it.",
        "definitionExample": "She <b>runs</b> a small coffee shop.",
        "exampleType": "runs",
        "examples": ["He <b>runs</b> the company.", "Who <b>runs</b> this department?"],
        "transcription": "rʌn"
      }
    ]
  },
  {
    "word": "happy",
    "meanings": [
      {
        "wordType": "adjective",
        "definition": "If you are <b>happy</b>, you feel pleasure, often because something good has happened.",
        "definitionExample": "She was <b>happy</b> to see her friends.",
        "exampleType": "happy",
        "examples": ["I'm so <b>happy</b> for you!", "They look very <b>happy</b> together."],
        "transcription": "ˈhæpi"
      }
    ]
  }
]

IMPORTANT:
- Process ALL ${words.length} words
- Include 1-4 meanings per word depending on how many common uses it has
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
