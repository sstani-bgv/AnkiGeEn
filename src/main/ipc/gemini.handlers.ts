import { IpcMain } from 'electron';
import { IPC_CHANNELS, ParsedWord } from '../../shared/types';
import { geminiService } from '../services/gemini.service';
import { settingsService } from '../services/settings.service';

export function setupGeminiHandlers(ipcMain: IpcMain): void {
  // Initialize AI service with API key from settings
  const initializeAI = async () => {
    const apiKey = await settingsService.get('geminiApiKey');
    if (apiKey) {
      geminiService.setApiKey(apiKey);
    }
  };

  // Initialize on setup
  initializeAI().catch(console.error);

  ipcMain.handle(IPC_CHANNELS.AI_GENERATE_BATCH, async (_, parsedWords: ParsedWord[], examplesCount: number) => {
    try {
      // Re-initialize in case API key was just set
      await initializeAI();
      return await geminiService.generateWordMeaningsBatch(parsedWords, examplesCount);
    } catch (error: any) {
      console.error('AI batch generation error:', error);
      throw new Error(error.message || 'Failed to generate word meanings');
    }
  });
}
