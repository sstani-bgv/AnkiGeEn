import { AnkiNote, BatchWordResult, AppSettings } from '../shared/types';

export interface ElectronAPI {
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
  anki: {
    getDecks: () => Promise<string[]>;
    getModels: () => Promise<string[]>;
    getModelFields: (modelName: string) => Promise<string[]>;
    storeMedia: (filename: string, data: string) => Promise<string>;
    addNote: (note: AnkiNote) => Promise<number>;
    checkConnection: () => Promise<boolean>;
  };
  ai: {
    generateBatch: (words: string[], examplesCount: number) => Promise<BatchWordResult[]>;
  };
  tts: {
    generateAudio: (text: string) => Promise<ArrayBuffer>;
  };
  settings: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    getAll: () => Promise<Partial<AppSettings>>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
