import { useState } from 'react'
import { AnkiNote, DataSource, GeneratedCard } from '../../shared/types'
import { useStore } from '../store'

export type AddStatus = 'idle' | 'adding' | 'success' | 'error';

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const useAddToAnki = () => {
  const {
    selectedDeck,
    selectedModel,
    fieldMapping
  } = useStore();

  const [status, setStatus] = useState<AddStatus>('idle');
  const [addedCount, setAddedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const buildFieldValue = (card: GeneratedCard, source: DataSource): string => {
    switch (source) {
      case DataSource.Word:
        return card.word;

      case DataSource.WordType:
        return card.wordType;

      case DataSource.Definition:
        return card.definition;

      case DataSource.DefinitionExample:
        return card.definitionExample;

      case DataSource.Transcription:
        return card.transcription || '';

      case DataSource.Examples:
        return card.examples.join('<br>');

      case DataSource.WordAudio:
        return card.audioFilename ? `[sound:${card.audioFilename}]` : '';

      case DataSource.ExampleType:
        return card.exampleType || '';

      case DataSource.None:
      default:
        return '';
    }
  };

  const addAllToAnki = async (cards: GeneratedCard[]) => {
    setStatus('adding');
    setAddedCount(0);
    setTotalCount(cards.length);
    setError(null);

    const shuffledCards = shuffleArray(cards);
    let successCount = 0;

    try {
      for (let i = 0; i < cards.length; i++) {
        const card = shuffledCards[i];

        // Skip cards with errors
        if (card.error) {
          setAddedCount(i + 1);
          continue;
        }

        // Build note fields based on field mapping
        const fields: { [key: string]: string } = {};
        for (const [fieldName, dataSource] of Object.entries(fieldMapping)) {
          fields[fieldName] = buildFieldValue(card, dataSource);
        }

        // Prepare audio data if needed
        const audio: { filename: string; data: string }[] = [];
        if (card.audioData && card.audioFilename) {
          // Convert ArrayBuffer to base64
          const arrayBuffer = card.audioData;
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let j = 0; j < bytes.byteLength; j++) {
            binary += String.fromCharCode(bytes[j]);
          }
          const base64Audio = btoa(binary);

          audio.push({
            filename: card.audioFilename,
            data: base64Audio
          });
        }

        // Create Anki note
        const note: AnkiNote = {
          deckName: selectedDeck,
          modelName: selectedModel,
          fields,
          audio: audio.length > 0 ? audio : undefined,
          tags: ['anki-generator']
        };

        // Add note to Anki
        await window.electronAPI.anki.addNote(note);
        successCount++;

        setAddedCount(i + 1);
      }

      setStatus('success');

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err: any) {
      console.error('Error adding cards to Anki:', err);
      setError(err.message || 'Unknown error occurred');
      setStatus('error');
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setError(null);
  };

  return {
    addAllToAnki,
    resetStatus,
    status,
    isAdding: status === 'adding',
    addedCount,
    totalCount,
    error
  };
};
