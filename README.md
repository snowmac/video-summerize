# YouTube Transcript Summarizer Extension

A Chrome extension that extracts YouTube video transcripts and summarizes them using AI services.

## Features

- **Transcript Extraction**: Automatically extracts transcripts from YouTube videos
- **AI Summarization**: Summarizes transcripts using various AI services
- **Custom Prompts**: Configure custom prompts for different summarization styles
- **Multiple AI Services**: Support for OpenAI ChatGPT, Anthropic Claude, and more
- **Progress Tracking**: Real-time progress updates during extraction and summarization
- **Copy to Clipboard**: Easy copying of transcripts and summaries
- **Settings Management**: Persistent settings storage

## Installation

### Development

1. Clone the repository:

```bash
git clone <repository-url>
cd ai-2.0
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the extension:

```bash
pnpm build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3` folder

### Production

1. Build the extension:

```bash
pnpm build
```

2. The extension files will be in `.output/chrome-mv3/`

## Usage

1. Navigate to any YouTube video page
2. Click the extension icon in your browser toolbar
3. Click "Extract & Summarize" to begin the process
4. The extension will:
   - Extract the video transcript
   - Generate a summary using the selected AI service
   - Display both the transcript and summary
5. Click on the transcript or summary to copy to clipboard

## Configuration

### AI Services

The extension supports multiple AI services:

- **Default AI**: Basic summarization (simulated)
- **OpenAI ChatGPT**: Uses OpenAI's GPT models
- **Anthropic Claude**: Uses Anthropic's Claude models

### Custom Prompts

You can configure custom prompts for different summarization styles:

- Enable "Use custom prompt" in settings
- Enter your custom prompt
- The prompt will be used instead of the default

### API Keys

For external AI services (OpenAI, Anthropic), you'll need to:

1. Get an API key from the respective service
2. Enter the API key in the extension settings
3. The extension will use your API key for requests

## Development

### Project Structure

```
ai-2.0/
├── entrypoints/
│   ├── background.ts          # Background script
│   ├── content.ts            # Content script for YouTube
│   └── popup/
│       ├── App.tsx           # Main popup interface
│       ├── main.tsx          # Popup entry point
│       └── index.html        # Popup HTML
├── public/
│   ├── youtube.js            # YouTube scraper service
│   └── icon/                 # Extension icons
├── package.json              # Dependencies and scripts
└── wxt.config.ts            # WXT configuration
```

### Key Components

#### YouTube Transcript Service (`public/youtube.js`)

- Handles transcript extraction from YouTube videos
- Automatically opens/closes transcript panels
- Extracts text from transcript segments
- Returns structured data with transcript and metadata

#### Content Script (`entrypoints/content.ts`)

- Injects into YouTube pages
- Listens for messages from the popup
- Executes transcript extraction
- Returns results to the popup

#### Popup Interface (`entrypoints/popup/App.tsx`)

- Main user interface
- Handles settings management
- Displays progress and results
- Manages AI service integration

### Building and Testing

```bash
# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Build for Firefox
pnpm build:firefox

# Create ZIP file for distribution
pnpm zip
```

## Technical Details

### Permissions

The extension requires the following permissions:

- `activeTab`: Access to the current tab
- `storage`: Save user settings
- `scripting`: Execute content scripts
- `*://*.youtube.com/*`: Access to YouTube pages

### Browser Compatibility

- Chrome/Chromium browsers
- Firefox (with `pnpm build:firefox`)

### Dependencies

- **WXT**: Extension development framework
- **React**: UI framework
- **Material-UI**: Component library
- **TypeScript**: Type safety
- **Marked**: Markdown rendering

## Troubleshooting

### Common Issues

1. **"Not on a YouTube video page"**

   - Make sure you're on a YouTube video page (URL contains `/watch`)
   - Refresh the page and try again

2. **"Transcript button not found"**

   - Some videos may not have transcripts available
   - Try a different video with captions/transcripts

3. **"Failed to communicate with content script"**
   - Refresh the YouTube page
   - Reload the extension
   - Check if the video has transcripts available

### Debug Mode

To enable debug logging:

1. Open the extension popup
2. Open browser developer tools
3. Check the console for detailed logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Roadmap

- [ ] Real AI API integration
- [ ] Support for more AI services
- [ ] Batch processing for multiple videos
- [ ] Export to various formats (PDF, DOCX)
- [ ] Custom styling options
- [ ] Keyboard shortcuts
- [ ] Offline mode with local AI models
