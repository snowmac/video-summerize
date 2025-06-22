// @ts-ignore
// eslint-disable-next-line
declare const chrome: any;

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
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon,
  Key as KeyIcon,
  AccountCircle as AccountIcon,
  OpenInNew as OpenInNewIcon,
  Save as SaveIcon
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
  },
  {
    id: 'grok',
    name: 'xAI Grok',
    defaultPrompt: 'Please summarize this YouTube video transcript in a clear and concise manner.',
    apiEndpoint: 'https://api.x.ai/v1/chat/completions'
  }
];

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [transcriptResult, setTranscriptResult] = useState<TranscriptResult | null>(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [aiService, setAiService] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Please provide a comprehensive summary of this transcript, highlighting the key points and main topics discussed.');
  const [showCopied, setShowCopied] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(['aiService', 'apiKey', 'customPrompt'], (result: { aiService?: string; apiKey?: string; customPrompt?: string }) => {
      if (result.aiService) setAiService(result.aiService);
      if (result.apiKey) setApiKey(result.apiKey);
      if (result.customPrompt) setCustomPrompt(result.customPrompt);
    });
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({ aiService, apiKey, customPrompt }, () => {
      setShowSaveNotification(true);
      setShowSettings(false);
    });
  };

  const openUrl = (url: string) => {
    chrome.tabs.create({ url });
  };

  const updateProgress = (value: number, message: string) => {
    setProgress(value);
    setStatus(message);
  };

  const extractTranscript = async () => {
    setIsLoading(true);
    setError('');
    setTranscriptResult(null);
    updateProgress(10, 'Checking if on YouTube video page...');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        throw new Error('No active tab found');
      }

      // Check if we're on a YouTube page
      if (!tab.url?.includes('youtube.com/watch')) {
        throw new Error('Please navigate to a YouTube video page to use this extension.');
      }

      updateProgress(20, 'Sending message to content script...');
      
      // Try to send message to content script
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: 'extractTranscript' });
      } catch (err) {
        // If content script is not found, try to inject it manually
        if (err instanceof Error && err.message.includes('Receiving end does not exist')) {
          updateProgress(25, 'Content script not found, attempting to inject...');
          
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content-scripts/content.js']
            });
            
            // Wait a moment for the script to load
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try again
            response = await chrome.tabs.sendMessage(tab.id, { action: 'extractTranscript' });
          } catch (injectionError) {
            throw new Error('Failed to inject content script. Please refresh the YouTube page and try again.');
          }
        } else {
          throw err;
        }
      }
      
      if (!response) {
        throw new Error('No response from content script. The extension may not be properly injected.');
      }
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.transcript) {
        throw new Error('No transcript found. Please make sure you are on a YouTube video page with available transcripts.');
      }

      setTranscriptResult(response);
      updateProgress(50, 'Transcript extracted successfully!');

      // If API key is provided, generate summary
      if (apiKey) {
        await generateSummary(response.transcript);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Transcript extraction error:', err);
      
      // Check if it's a connection error
      if (errorMessage.includes('Receiving end does not exist')) {
        setError('Content script not found. Please refresh the YouTube page and try again.');
      } else {
        setError(errorMessage);
      }
      
      updateProgress(0, 'Failed to extract transcript');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async (transcript: string) => {
    updateProgress(60, 'Generating summary...');
    
    if (!apiKey) {
      setError('No API key provided. Please add your API key in settings.');
      updateProgress(0, 'No API key available');
      return;
    }

    try {
      let summary = '';
      
      if (aiService === 'openai') {
        summary = await callOpenAI(transcript, apiKey, customPrompt);
      } else if (aiService === 'anthropic') {
        summary = await callAnthropic(transcript, apiKey, customPrompt);
      } else if (aiService === 'grok') {
        summary = await callGrok(transcript, apiKey, customPrompt);
      } else if (aiService === 'huggingface') {
        summary = await callHuggingFace(transcript, apiKey, customPrompt);
      } else {
        throw new Error(`Unsupported AI service: ${aiService}`);
      }
      
      setSummary(summary);
      updateProgress(100, 'Summary generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Summary generation error:', err);
      setError(`Failed to generate summary: ${errorMessage}`);
      updateProgress(0, 'Summary generation failed');
    }
  };

  const callOpenAI = async (transcript: string, apiKey: string, prompt: string): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `${prompt}\n\nTranscript:\n${transcript}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response from OpenAI';
    } catch (err) {
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to OpenAI API. Please check your internet connection.');
      }
      throw err;
    }
  };

  const callAnthropic = async (transcript: string, apiKey: string, prompt: string): Promise<string> => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `${prompt}\n\nTranscript:\n${transcript}`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0]?.text || 'No response from Anthropic';
    } catch (err) {
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to Anthropic API. Please check your internet connection.');
      }
      throw err;
    }
  };

  const callGrok = async (transcript: string, apiKey: string, prompt: string): Promise<string> => {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'user',
              content: `${prompt}\n\nTranscript:\n${transcript}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`xAI Grok API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response from xAI Grok';
    } catch (err) {
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to xAI Grok API. Please check your internet connection.');
      }
      throw err;
    }
  };

  const callHuggingFace = async (transcript: string, apiKey: string, prompt: string): Promise<string> => {
    try {
      // Using a good summarization model
      const model = 'microsoft/DialoGPT-medium'; // You can change this to other models
      
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          inputs: `${prompt}\n\nTranscript:\n${transcript}`,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Hugging Face API error (${response.status}): ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      // Hugging Face returns different formats depending on the model
      if (Array.isArray(data) && data.length > 0) {
        return data[0].generated_text || data[0].summary_text || 'No response from Hugging Face';
      } else if (data.generated_text) {
        return data.generated_text;
      } else if (data.summary_text) {
        return data.summary_text;
      } else {
        return 'No response from Hugging Face';
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to Hugging Face API. Please check your internet connection.');
      }
      throw err;
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

  if (showSettings) {
    return (
      <Box sx={{ width: 400, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Settings</Typography>
          <IconButton onClick={() => setShowSettings(false)}>
            <SettingsIcon />
          </IconButton>
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>AI Service</Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel>AI Service</InputLabel>
          <Select
            value={aiService}
            onChange={(e) => {
              setAiService(e.target.value);
              // Clear API key when switching services
              setApiKey('');
            }}
            label="AI Service"
          >
            <MenuItem value="openai">OpenAI GPT-4</MenuItem>
            <MenuItem value="anthropic">Anthropic Claude</MenuItem>
            <MenuItem value="grok">xAI Grok</MenuItem>
            <MenuItem value="huggingface">Hugging Face (Free)</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="API Key"
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          margin="normal"
          helperText="Your API key will be stored securely in browser storage"
        />
        <TextField
          fullWidth
          label="Custom Prompt"
          multiline
          rows={4}
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          margin="normal"
          helperText="Customize how the AI should summarize the transcript"
        />
        <Button fullWidth variant="contained" onClick={saveSettings} startIcon={<SaveIcon />} sx={{ mt: 2 }}>Save Settings</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 400, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>YouTube Transcript Summarizer</Typography>
        <IconButton onClick={() => setShowHelp(true)}><HelpIcon /></IconButton>
        <IconButton onClick={() => setShowSettings(true)}><SettingsIcon /></IconButton>
      </Box>
      {(isLoading || status) && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant={isLoading ? 'indeterminate' : 'determinate'} value={progress} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">{status}</Typography>
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!transcriptResult ? (
        <Button
          fullWidth
          variant="contained"
          startIcon={<PlayIcon />}
          onClick={extractTranscript}
          disabled={isLoading}
          sx={{ mb: 2 }}
        >
          {isLoading ? 'Processing...' : 'Extract & Summarize'}
        </Button>
      ) : null}
      {transcriptResult && transcriptResult.transcript && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Transcript</Typography>
          <Box
            sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1, cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
            onClick={copyTranscript}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{transcriptResult.transcript}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">Click to copy transcript</Typography>
        </Paper>
      )}
      {summary && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>AI Summary</Typography>
            <IconButton onClick={copySummary} size="small"><CopyIcon /></IconButton>
          </Box>
          <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1 }}
            dangerouslySetInnerHTML={{ __html: marked(summary) }}
          />
        </Paper>
      )}
      {transcriptResult && (
        <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={() => { setTranscriptResult(null); setSummary(''); setStatus(''); setProgress(0); }}>Extract New Transcript</Button>
      )}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpIcon sx={{ mr: 1 }} /> How to Get API Keys
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            To use external AI services, you'll need to obtain API keys from the respective providers. Here's how to get them:
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="OpenAI ChatGPT" /></AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem><ListItemIcon><LinkIcon /></ListItemIcon><ListItemText primary="Visit OpenAI Platform" secondary="Go to https://platform.openai.com/api-keys" /><IconButton size="small" onClick={() => openUrl('https://platform.openai.com/api-keys')}><OpenInNewIcon /></IconButton></ListItem>
                <ListItem><ListItemIcon><AccountIcon /></ListItemIcon><ListItemText primary="Sign in or Create Account" secondary="Log in to your OpenAI account or create a new one" /></ListItem>
                <ListItem><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="Create API Key" secondary="Click 'Create new secret key' and copy the generated key" /></ListItem>
                <ListItem><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="Add Payment Method" secondary="Add a payment method to your account (OpenAI charges per request)" /></ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="Anthropic Claude" /></AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem><ListItemIcon><LinkIcon /></ListItemIcon><ListItemText primary="Visit Anthropic Console" secondary="Go to https://console.anthropic.com/" /><IconButton size="small" onClick={() => openUrl('https://console.anthropic.com/')}><OpenInNewIcon /></IconButton></ListItem>
                <ListItem><ListItemIcon><AccountIcon /></ListItemIcon><ListItemText primary="Sign in or Create Account" secondary="Log in to your Anthropic account or create a new one" /></ListItem>
                <ListItem><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="Create API Key" secondary="Navigate to 'API Keys' and click 'Create Key'" /></ListItem>
                <ListItem><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="Copy the Key" secondary="Copy the generated API key (starts with 'sk-ant-')" /></ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="xAI Grok" /></AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem><ListItemIcon><LinkIcon /></ListItemIcon><ListItemText primary="Visit xAI Platform" secondary="Go to https://console.x.ai/" /><IconButton size="small" onClick={() => openUrl('https://console.x.ai/')}><OpenInNewIcon /></IconButton></ListItem>
                <ListItem><ListItemIcon><AccountIcon /></ListItemIcon><ListItemText primary="Sign in with X/Twitter" secondary="Log in using your X (Twitter) account" /></ListItem>
                <ListItem><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="Create API Key" secondary="Navigate to 'API Keys' and create a new key" /></ListItem>
                <ListItem><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="Copy the Key" secondary="Copy the generated API key" /></ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="Hugging Face (Free)" /></AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem><ListItemIcon><LinkIcon /></ListItemIcon><ListItemText primary="Visit Hugging Face" secondary="Go to https://huggingface.co/settings/tokens" /><IconButton size="small" onClick={() => openUrl('https://huggingface.co/settings/tokens')}><OpenInNewIcon /></IconButton></ListItem>
                <ListItem><ListItemIcon><AccountIcon /></ListItemIcon><ListItemText primary="Sign in or Create Account" secondary="Log in to your Hugging Face account or create a new one" /></ListItem>
                <ListItem><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="Create Access Token" secondary="Click 'New token' and select 'Read' permissions" /></ListItem>
                <ListItem><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="Copy the Token" secondary="Copy the generated access token (starts with 'hf_')" /></ListItem>
                <ListItem><ListItemIcon><KeyIcon /></ListItemIcon><ListItemText primary="Free Tier" secondary="30,000 requests per month free" /></ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
          <Alert severity="info" sx={{ mt: 2 }}><Typography variant="body2"><strong>Security Note:</strong> Your API keys are stored locally in your browser and are only used to make requests to the respective AI services. Never share your API keys publicly.</Typography></Alert>
        </DialogContent>
        <DialogActions><Button onClick={() => setShowHelp(false)}>Close</Button></DialogActions>
      </Dialog>
      <Snackbar open={showSaveNotification} autoHideDuration={3000} onClose={() => setShowSaveNotification(false)} message="Settings saved successfully!" action={<IconButton size="small" color="inherit"><CheckIcon /></IconButton>} />
      <Snackbar open={showCopied} autoHideDuration={2000} onClose={() => setShowCopied(false)} message="Copied to clipboard!" action={<IconButton size="small" color="inherit"><CheckIcon /></IconButton>} />
    </Box>
  );
};

export default App;
