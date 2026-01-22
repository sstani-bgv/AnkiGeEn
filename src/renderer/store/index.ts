import { create } from 'zustand';
import {
  GeneratedCard,
  FieldMapping,
  DataSource,
  GenerationProgress,
  GenerationStage
} from '../../shared/types';

// Auto-mapping helper: intelligently maps field names to data sources
function autoMapFields(fieldNames: string[]): FieldMapping {
  const mapping: FieldMapping = {};

  for (const fieldName of fieldNames) {
    const lowerField = fieldName.toLowerCase().trim();

    // Match Word field
    if (lowerField === 'word' || lowerField === 'english' || lowerField === 'front') {
      mapping[fieldName] = DataSource.Word;
    }
    // Match Word Type field
    else if (lowerField === 'word type' || lowerField === 'type' || lowerField === 'part of speech' ||
             lowerField === 'pos') {
      mapping[fieldName] = DataSource.WordType;
    }
    // Match Definition field
    else if (lowerField === 'definition' || lowerField === 'meaning' || lowerField === 'back') {
      mapping[fieldName] = DataSource.Definition;
    }
    // Match Definition Example field
    else if (lowerField === 'definition example' || lowerField === 'def example') {
      mapping[fieldName] = DataSource.DefinitionExample;
    }
    // Match Transcription field
    else if (lowerField === 'transcription' || lowerField === 'ipa' ||
             lowerField === 'pronunciation' || lowerField === 'phonetic') {
      mapping[fieldName] = DataSource.Transcription;
    }
    // Match Examples field
    else if (lowerField === 'example' || lowerField === 'examples' ||
             lowerField === 'example(s)' || lowerField === 'context') {
      mapping[fieldName] = DataSource.Examples;
    }
    // Match Word Audio field
    else if (lowerField === 'audio' || lowerField === 'sound' ||
             lowerField === 'word audio' || lowerField === 'pronunciation audio') {
      mapping[fieldName] = DataSource.WordAudio;
    }
    // Match Example Type field
    else if (lowerField === 'example type' || lowerField === 'word form' ||
             lowerField === 'related form') {
      mapping[fieldName] = DataSource.ExampleType;
    }
    // Default to None for unrecognized fields
    else {
      mapping[fieldName] = DataSource.None;
    }
  }

  return mapping;
}

interface AppState {
  // Words slice
  words: string[];
  setWords: (words: string[]) => void;

  // Settings slice
  geminiApiKey: string;
  selectedDeck: string;
  selectedModel: string;
  exampleCount: number;
  fieldMapping: FieldMapping;
  availableDecks: string[];
  availableModels: string[];
  availableFields: string[];

  setGeminiApiKey: (key: string) => void;
  setSelectedDeck: (deck: string) => void;
  setSelectedModel: (model: string) => void;
  setExampleCount: (count: number) => void;
  setFieldMapping: (mapping: FieldMapping) => void;
  setAvailableDecks: (decks: string[]) => void;
  setAvailableModels: (models: string[]) => void;
  setAvailableFields: (fields: string[]) => void;

  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;

  // Generation slice
  generatedCards: GeneratedCard[];
  generationProgress: GenerationProgress;
  isGenerating: boolean;

  setGeneratedCards: (cards: GeneratedCard[]) => void;
  addGeneratedCard: (card: GeneratedCard) => void;
  removeGeneratedCard: (word: string) => void;
  setGenerationProgress: (progress: GenerationProgress) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  resetGeneration: () => void;

  // Anki connection status
  ankiConnected: boolean;
  setAnkiConnected: (connected: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Words state
  words: [],
  setWords: (words) => set({ words }),

  // Settings state
  geminiApiKey: '',
  selectedDeck: '',
  selectedModel: '',
  exampleCount: 3,
  fieldMapping: {},
  availableDecks: [],
  availableModels: [],
  availableFields: [],

  setGeminiApiKey: (key) => set({ geminiApiKey: key }),
  setSelectedDeck: (deck) => set({ selectedDeck: deck }),
  setSelectedModel: async (model) => {
    set({ selectedModel: model });

    // Load fields for the selected model
    if (model) {
      try {
        const fields = await window.electronAPI.anki.getModelFields(model);
        set({ availableFields: fields });

        // Auto-map fields based on field names
        const autoMapping = autoMapFields(fields);
        set({ fieldMapping: autoMapping });
      } catch (error) {
        console.error('Failed to load model fields:', error);
      }
    }
  },
  setExampleCount: (count) => set({ exampleCount: count }),
  setFieldMapping: (mapping) => set({ fieldMapping: mapping }),
  setAvailableDecks: (decks) => set({ availableDecks: decks }),
  setAvailableModels: (models) => set({ availableModels: models }),
  setAvailableFields: (fields) => set({ availableFields: fields }),

  loadSettings: async () => {
    try {
      const settings = await window.electronAPI.settings.getAll();
      set({
        geminiApiKey: settings.geminiApiKey || '',
        selectedDeck: settings.selectedDeck || '',
        selectedModel: settings.selectedModel || '',
        exampleCount: settings.exampleCount || 3,
        fieldMapping: settings.fieldMapping || {}
      });

      // Load available fields if model is selected
      if (settings.selectedModel) {
        const fields = await window.electronAPI.anki.getModelFields(settings.selectedModel);
        set({ availableFields: fields });

        // If no field mapping exists, auto-map based on field names
        if (!settings.fieldMapping || Object.keys(settings.fieldMapping).length === 0) {
          const autoMapping = autoMapFields(fields);
          set({ fieldMapping: autoMapping });
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  saveSettings: async () => {
    const state = get();
    try {
      await window.electronAPI.settings.set('geminiApiKey', state.geminiApiKey);
      await window.electronAPI.settings.set('selectedDeck', state.selectedDeck);
      await window.electronAPI.settings.set('selectedModel', state.selectedModel);
      await window.electronAPI.settings.set('exampleCount', state.exampleCount);
      await window.electronAPI.settings.set('fieldMapping', state.fieldMapping);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  },

  // Generation state
  generatedCards: [],
  generationProgress: {
    currentWord: '',
    currentStage: GenerationStage.Idle,
    completedCards: 0,
    totalCards: 0
  },
  isGenerating: false,

  setGeneratedCards: (cards) => set({ generatedCards: cards }),
  addGeneratedCard: (card) => set((state) => ({
    generatedCards: [...state.generatedCards, card]
  })),
  removeGeneratedCard: (word) => set((state) => ({
    generatedCards: state.generatedCards.filter((c) => c.word !== word)
  })),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  resetGeneration: () => set({
    generatedCards: [],
    generationProgress: {
      currentWord: '',
      currentStage: GenerationStage.Idle,
      completedCards: 0,
      totalCards: 0
    },
    isGenerating: false
  }),

  // Anki connection
  ankiConnected: false,
  setAnkiConnected: (connected) => set({ ankiConnected: connected })
}));
