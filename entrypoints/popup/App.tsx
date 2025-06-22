// Type declaration for browser API
declare const browser: any;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  Divider,
  IconButton,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { marked } from 'marked';

interface TranscriptResult {
  success: boolean;
  transcript?: string;
  videoTitle?: string;
  videoUrl?: string;
  error?: string;
}

interface AIService {
  id: string;
  name: string;
  defaultPrompt: string;
  apiEndpoint?: string;
}

const AI_SERVICES: AIService[] = [
  {
    id: 'default',
    name: 'Default AI',
    defaultPrompt: 'Please summarize this video transcript from YouTube'
  },
  {
    id: 'openai',
    name: 'OpenAI ChatGPT',
    defaultPrompt: 'Please provide a comprehensive summary of this YouTube video transcript with key points and insights.',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    defaultPrompt: 'Please analyze and summarize this YouTube video transcript, highlighting the main topics and key takeaways.',
    apiEndpoint: 'https://api.anthropic.com/v1/messages'
  }
];

function App() {
  const [currentTab, setCurrentTab] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [transcriptResult, setTranscriptResult] = useState<TranscriptResult | null>(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAIService, setSelectedAIService] = useState('default');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    // Get current tab
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs: any) => {
      if (tabs[0]) {
        setCurrentTab(tabs[0]);
      }
    });

    // Load saved settings
    browser.storage.sync.get(['selectedAIService', 'customPrompt', 'useCustomPrompt', 'apiKey']).then((result: any) => {
      if (result.selectedAIService) setSelectedAIService(result.selectedAIService);
      if (result.customPrompt) setCustomPrompt(result.customPrompt);
      if (result.useCustomPrompt !== undefined) setUseCustomPrompt(result.useCustomPrompt);
      if (result.apiKey) setApiKey(result.apiKey);
    });
  }, []);

  const saveSettings = () => {
    browser.storage.sync.set({
      selectedAIService,
      customPrompt,
      useCustomPrompt,
      apiKey
    });
  };

  const updateProgress = (value: number, message: string) => {
    setProgress(value);
    setStatus(message);
  };

  const extractTranscript = async () => {
    if (!currentTab?.id) {
      setError('No active tab found');
      return;
    }

    setIsLoading(true);
    setError('');
    setTranscriptResult(null);
    setSummary('');
    updateProgress(10, 'Checking if on YouTube video page...');

    try {
      // Send message to content script
      const response = await browser.tabs.sendMessage(currentTab.id, {
        action: 'extractTranscript'
      });

      if (response.success) {
        setTranscriptResult(response);
        updateProgress(50, 'Transcript extracted successfully!');
        
        // Generate summary
        await generateSummary(response.transcript || '');
      } else {
        setError(response.error || 'Failed to extract transcript');
        updateProgress(0, 'Failed to extract transcript');
      }
    } catch (error) {
      setError('Failed to communicate with content script. Make sure you are on a YouTube video page.');
      updateProgress(0, 'Communication error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async (transcript: string) => {
    updateProgress(60, 'Generating summary...');

    try {
      const selectedService = AI_SERVICES.find(service => service.id === selectedAIService);
      const prompt = useCustomPrompt && customPrompt 
        ? customPrompt 
        : selectedService?.defaultPrompt || 'Please summarize this video transcript from YouTube';

      // For now, we'll simulate AI processing
      // In a real implementation, you would call the actual AI API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSummary = `# Summary of "${transcriptResult?.videoTitle || 'YouTube Video'}"

## Key Points
- This is a simulated summary of the video transcript
- The actual implementation would call ${selectedService?.name || 'Default AI'}
- The transcript contains approximately ${transcript.split(' ').length} words

## Main Topics
- Topic 1: [Extracted from transcript]
- Topic 2: [Extracted from transcript]
- Topic 3: [Extracted from transcript]

## Key Takeaways
- Takeaway 1: [Generated from transcript analysis]
- Takeaway 2: [Generated from transcript analysis]
- Takeaway 3: [Generated from transcript analysis]

*This summary was generated using the YouTube Transcript Summarizer extension.*`;

      setSummary(mockSummary);
      updateProgress(100, 'Summary generated successfully!');
    } catch (error) {
      setError('Failed to generate summary');
      updateProgress(0, 'Summary generation failed');
    }
  };

  const copyTranscript = () => {
    if (transcriptResult?.transcript) {
      navigator.clipboard.writeText(transcriptResult.transcript);
      setShowCopied(true);
    }
  };

  const copySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setShowCopied(true);
    }
  };

  const isYouTubePage = currentTab?.url?.includes('youtube.com/watch');

  return (
    <Box sx={{ width: 400, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          YouTube Transcript Summarizer
        </Typography>
        <IconButton onClick={() => setShowSettings(!showSettings)}>
          <SettingsIcon />
        </IconButton>
      </Box>

      {!isYouTubePage && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please navigate to a YouTube video page to use this extension.
        </Alert>
      )}

      {showSettings && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Settings</Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>AI Service</InputLabel>
            <Select
              value={selectedAIService}
              onChange={(e) => setSelectedAIService(e.target.value)}
              label="AI Service"
            >
              {AI_SERVICES.map(service => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={useCustomPrompt}
                onChange={(e) => setUseCustomPrompt(e.target.checked)}
              />
            }
            label="Use custom prompt"
            sx={{ mb: 2 }}
          />

          {useCustomPrompt && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Custom Prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          {selectedAIService !== 'default' && (
            <TextField
              fullWidth
              label="API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          <Button variant="contained" onClick={saveSettings}>
            Save Settings
          </Button>
        </Paper>
      )}

      <Button
        fullWidth
        variant="contained"
        startIcon={<PlayIcon />}
        onClick={extractTranscript}
        disabled={isLoading || !isYouTubePage}
        sx={{ mb: 2 }}
      >
        {isLoading ? 'Processing...' : 'Extract & Summarize'}
      </Button>

      {isLoading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {status}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {transcriptResult && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Transcript
          </Typography>
          <Box
            sx={{
              maxHeight: 200,
              overflow: 'auto',
              border: '1px solid #ddd',
              borderRadius: 1,
              p: 1,
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
            onClick={copyTranscript}
          >
            <Typography variant="body2">
              {transcriptResult.transcript}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Click to copy transcript
          </Typography>
        </Paper>
      )}

      {summary && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Summary
            </Typography>
            <IconButton onClick={copySummary} size="small">
              <CopyIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              maxHeight: 300,
              overflow: 'auto',
              border: '1px solid #ddd',
              borderRadius: 1,
              p: 1
            }}
            dangerouslySetInnerHTML={{ __html: marked(summary) }}
          />
        </Paper>
      )}

      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        message="Copied to clipboard!"
        action={
          <IconButton size="small" color="inherit">
            <CheckIcon />
          </IconButton>
        }
      />
    </Box>
  );
}

export default App;
