# AnkiGenerator

A desktop application for automatic Anki flashcard generation using Gemini AI with free audio pronunciation.

## Features

- **Automated Card Generation**: Generate flashcards with translations, transcriptions, examples, and audio pronunciations
- **Multiple Example Sentences**: Configure the number of example sentences (1-5) per word
- **Free Audio Pronunciation**: Generate audio pronunciation using Google Translate TTS (no API key required)
- **Anki Integration**: Direct integration with Anki through AnkiConnect
- **Field Mapping**: Flexible mapping of generated data to Anki note fields
- **Batch Processing**: Process multiple words at once with progress tracking

## Prerequisites

Before using AnkiGenerator, you need:

1. **Anki** - Install from [https://apps.ankiweb.net](https://apps.ankiweb.net)
2. **AnkiConnect Add-on** - Install from Anki:
   - Open Anki
   - Go to Tools → Add-ons → Get Add-ons
   - Enter code: `2055492159`
   - Restart Anki

3. **API Key**:
   - **Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd AnkiGenerator
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

4. Start the application:
```bash
npm start
```

### Building for Distribution

To create a distributable package:

```bash
npm run package
```

The built application will be in the `release` folder.

## Usage

### 1. Setup Tab

Configure the application settings:

1. **Anki Connection**
   - Make sure Anki is running
   - Click "Refresh" to check the connection status
   - If disconnected, ensure AnkiConnect addon is installed

2. **API Key**
   - Enter your Gemini API key
   - The key is stored securely on your local machine

3. **Anki Settings**
   - Select a deck from the dropdown
   - Select a note type (model)
   - Choose the number of example sentences (1-5)

4. **Field Mapping**
   - Map each field of your selected note type to data sources:
     - **Word**: The English word
     - **Translation**: Russian translation
     - **Transcription**: IPA phonetic transcription
     - **Examples**: Example sentences in English
     - **Example Translations**: Example sentences in Russian
     - **Audio**: Audio pronunciation file
     - **None**: Leave field empty

5. Click "Save Settings" to persist your configuration

### 2. Input Tab

Add words for flashcard generation:

1. Enter English words in the text area
   - One word per line, or
   - Comma-separated words
2. Click "Parse Words" to process the list
3. Review the parsed words (shown as chips)
4. Remove individual words by clicking the × button if needed

### 3. Generate Tab

Start the generation process:

1. Review the settings summary
2. Ensure all requirements are met (shown in validation errors if not)
3. Click "Start Generation"
4. Monitor progress:
   - Current word being processed
   - Current stage (Translation, Examples, Audio)
   - Progress bar
   - Completed cards count

The generation process:
- **Translation Stage**: Generates Russian translation and IPA transcription
- **Examples Stage**: Creates example sentences with translations
- **Audio Stage**: Generates free audio pronunciation using Google Translate TTS

### 4. Preview Tab

Review and add cards to Anki:

1. Review generated flashcards
   - Click on a card to expand and see all details
   - Play audio to hear pronunciation
   - Check translations and examples
2. Remove any unwanted cards using the "Remove" button
3. Click "Add All to Anki" to import all cards
4. Monitor the import progress

## Field Mapping Examples

### Example 1: Basic Model

For Anki's default "Basic" model with fields: Front, Back

- **Front** → Word
- **Back** → Translation + Examples

### Example 2: Custom Vocabulary Model

For a custom model with fields: Word, Translation, Transcription, Examples, Audio

- **Word** → Word
- **Translation** → Translation
- **Transcription** → Transcription
- **Examples** → Examples
- **Audio** → Audio

### Example 3: Advanced Model

For a model with: English, Russian, Pronunciation, Context, Sound

- **English** → Word
- **Russian** → Translation
- **Pronunciation** → Transcription
- **Context** → Examples
- **Sound** → Audio

## Troubleshooting

### Anki Connection Issues

**Problem**: "Anki is not running or AnkiConnect addon is not installed"

**Solutions**:
1. Make sure Anki is running
2. Verify AnkiConnect is installed (Tools → Add-ons)
3. Restart Anki after installing AnkiConnect
4. Check if another application is using port 8765

### API Key Errors

**Problem**: "Invalid API key" or "Failed to generate..."

**Solutions**:
1. Verify your Gemini API key is entered correctly (no extra spaces)
2. Check the API key is active in [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Ensure you have API credits/quota available

### Generation Errors

**Problem**: Some words fail to generate

**Solutions**:
1. Check your internet connection
2. Verify API rate limits haven't been exceeded
3. Try generating fewer words at once
4. Check the error message in the generated card for details

## Project Structure

```
AnkiGenerator/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── index.ts            # Entry point
│   │   ├── preload.ts          # IPC bridge
│   │   ├── services/           # Business logic
│   │   └── ipc/                # IPC handlers
│   ├── renderer/                # React UI
│   │   ├── App.tsx             # Main app component
│   │   ├── components/         # UI components
│   │   ├── hooks/              # Custom React hooks
│   │   └── store/              # Zustand state management
│   └── shared/                 # Shared types
├── dist/                        # Build output
└── package.json
```

## Technology Stack

- **Electron**: Desktop application framework
- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Zustand**: State management
- **Webpack**: Module bundler
- **Gemini API**: AI-powered translation and examples
- **Google Translate TTS**: Free text-to-speech for audio
- **AnkiConnect**: Anki integration

## Development

### Available Scripts

- `npm run build` - Build the application
- `npm start` - Start the Electron app
- `npm run dev` - Build and start in one command
- `npm run package` - Create distributable packages

### Development Tips

1. Use Chrome DevTools (opened automatically in development mode)
2. Check the console for errors and logs
3. Settings are stored in:
   - Windows: `%APPDATA%/anki-generator-settings`
   - macOS: `~/Library/Application Support/anki-generator-settings`
   - Linux: `~/.config/anki-generator-settings`

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue on the project repository.
