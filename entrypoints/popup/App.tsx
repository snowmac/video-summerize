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
  AccordionDetails
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
  OpenInNew as OpenInNewIcon
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

function App() {
  const [currentTab, setCurrentTab] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [transcriptResult, setTranscriptResult] = useState<TranscriptResult | null>(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedAIService, setSelectedAIService] = useState('default');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
    setShowSaveNotification(true);
    setShowSettings(false); // Close settings and return to main screen
  };

  const openUrl = (url: string) => {
    browser.tabs.create({ url });
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
    setIsExpanded(false);
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
      setIsExpanded(true); // Expand the overlay for better reading
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
    <Box sx={{ 
      width: isExpanded ? '70vw' : 400, 
      maxWidth: isExpanded ? '70vw' : 400,
      minWidth: isExpanded ? '50vw' : 400,
      p: 2,
      transition: 'all 0.3s ease-in-out'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          YouTube Transcript Summarizer
        </Typography>
        <IconButton onClick={() => setShowHelp(true)}>
          <HelpIcon />
        </IconButton>
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
              maxHeight: isExpanded ? 300 : 200,
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
              maxHeight: isExpanded ? 500 : 300,
              overflow: 'auto',
              border: '1px solid #ddd',
              borderRadius: 1,
              p: 1
            }}
            dangerouslySetInnerHTML={{ __html: marked(summary) }}
          />
        </Paper>
      )}

      {/* Help Dialog */}
      <Dialog 
        open={showHelp} 
        onClose={() => setShowHelp(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpIcon sx={{ mr: 1 }} />
            How to Get API Keys
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            To use external AI services, you'll need to obtain API keys from the respective providers. 
            Here's how to get them:
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>
                <KeyIcon />
              </ListItemIcon>
              <ListItemText primary="OpenAI ChatGPT" />
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <LinkIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Visit OpenAI Platform" 
                    secondary="Go to https://platform.openai.com/api-keys"
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => openUrl('https://platform.openai.com/api-keys')}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sign in or Create Account" 
                    secondary="Log in to your OpenAI account or create a new one"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <KeyIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Create API Key" 
                    secondary="Click 'Create new secret key' and copy the generated key"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <KeyIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Add Payment Method" 
                    secondary="Add a payment method to your account (OpenAI charges per request)"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>
                <KeyIcon />
              </ListItemIcon>
              <ListItemText primary="Anthropic Claude" />
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <LinkIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Visit Anthropic Console" 
                    secondary="Go to https://console.anthropic.com/"
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => openUrl('https://console.anthropic.com/')}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sign in or Create Account" 
                    secondary="Log in to your Anthropic account or create a new one"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <KeyIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Create API Key" 
                    secondary="Navigate to 'API Keys' and click 'Create Key'"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <KeyIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Copy the Key" 
                    secondary="Copy the generated API key (starts with 'sk-ant-')"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>
                <KeyIcon />
              </ListItemIcon>
              <ListItemText primary="xAI Grok" />
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <LinkIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Visit xAI Platform" 
                    secondary="Go to https://console.x.ai/"
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => openUrl('https://console.x.ai/')}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sign in with X/Twitter" 
                    secondary="Log in using your X (Twitter) account"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <KeyIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Create API Key" 
                    secondary="Navigate to 'API Keys' and create a new key"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <KeyIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Copy the Key" 
                    secondary="Copy the generated API key"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Security Note:</strong> Your API keys are stored locally in your browser and are only used to make requests to the respective AI services. 
              Never share your API keys publicly.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelp(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Save Notification */}
      <Snackbar
        open={showSaveNotification}
        autoHideDuration={3000}
        onClose={() => setShowSaveNotification(false)}
        message="Settings saved successfully!"
        action={
          <IconButton size="small" color="inherit">
            <CheckIcon />
          </IconButton>
        }
      />

      {/* Copy Notification */}
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
