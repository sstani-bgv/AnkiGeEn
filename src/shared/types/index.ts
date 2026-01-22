// Re-export word parser types
export { ParsedWord, PartOfSpeech } from '../utils/wordParser';

// Core data types

export interface GeneratedCard {
  word: string;
  wordType: string;
  definition: string;
  definitionExample: string;
  transcription?: string;
  examples: string[];
  exampleType?: string;
  audioFilename?: string;
  audioData?: Buffer;
  error?: string;
}

export interface Example {
  sentence: string;
}

export enum DataSource {
  Word = 'Word',
  WordType = 'Word Type',
  Definition = 'Definition',
  DefinitionExample = 'Definition Example',
  Transcription = 'Transcription',
  Examples = 'Example(s)',
  WordAudio = 'Word Audio',
  ExampleType = 'Example Type',
  None = 'None'
}

export interface FieldMapping {
  [ankiFieldName: string]: DataSource;
}

// Settings types

export interface AppSettings {
  geminiApiKey?: string;
  selectedDeck?: string;
  selectedModel?: string;
  exampleCount: number;
  fieldMapping: FieldMapping;
}

// Anki types

export interface AnkiDeck {
  name: string;
}

export interface AnkiModel {
  name: string;
  fields: string[];
}

export interface AnkiNote {
  deckName: string;
  modelName: string;
  fields: { [key: string]: string };
  audio?: {
    filename: string;
    data: string; // base64
  }[];
  tags?: string[];
}

// API response types

export interface WordMeaningResponse {
  wordType: string;
  definition: string;
  definitionExample: string;
  exampleType: string;
  examples: string[];
  transcription: string;
}

export interface BatchWordResult {
  word: string;
  meanings: WordMeaningResponse[];
}

// Generation progress types

export enum GenerationStage {
  Idle = 'Idle',
  Definition = 'Definition',
  Examples = 'Examples',
  Audio = 'Audio',
  Complete = 'Complete',
  Error = 'Error'
}

export interface GenerationProgress {
  currentWord: string;
  currentStage: GenerationStage;
  completedCards: number;
  totalCards: number;
  error?: string;
}

// IPC channel names

export const IPC_CHANNELS = {
  // AnkiConnect
  ANKI_GET_DECKS: 'anki:getDecks',
  ANKI_GET_MODELS: 'anki:getModels',
  ANKI_GET_MODEL_FIELDS: 'anki:getModelFields',
  ANKI_STORE_MEDIA: 'anki:storeMedia',
  ANKI_ADD_NOTE: 'anki:addNote',
  ANKI_CHECK_CONNECTION: 'anki:checkConnection',

  // AI (ProxyAPI)
  AI_GENERATE_BATCH: 'ai:generateBatch',

  // TTS
  TTS_GENERATE_AUDIO: 'tts:generateAudio',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_GET_ALL: 'settings:getAll'
} as const;
