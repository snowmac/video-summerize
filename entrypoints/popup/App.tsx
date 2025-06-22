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
import SettingsDialog from './SettingsDialog';
import HelpDialog from './HelpDialog';
import TranscriptPanel from './TranscriptPanel';
import SummaryPanel from './SummaryPanel';
import StatusBar from './StatusBar';
import MainActions from './MainActions';
import { invokeAI, AIServiceType } from '../ai';

interface TranscriptResult {
  success: boolean;
  transcript?: string;
  videoTitle?: string;
  videoUrl?: string;
  error?: string;
}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [transcriptResult, setTranscriptResult] = useState<TranscriptResult | null>(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [aiService, setAiService] = useState<AIServiceType>(AIServiceType.OpenAI);
  const [apiKey, setApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Please provide a comprehensive summary of this transcript, highlighting the key points and main topics discussed.');
  const [showCopied, setShowCopied] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(['aiService', 'apiKey', 'customPrompt'], (result: { aiService?: string; apiKey?: string; customPrompt?: string }) => {
      if (result.aiService) setAiService(result.aiService as AIServiceType);
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
      if (!tab.id) throw new Error('No active tab found');
      if (!tab.url?.includes('youtube.com/watch')) throw new Error('Please navigate to a YouTube video page to use this extension.');
      updateProgress(20, 'Sending message to content script...');
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: 'extractTranscript' });
      } catch (err) {
        if (err instanceof Error && err.message.includes('Receiving end does not exist')) {
          updateProgress(25, 'Content script not found, attempting to inject...');
          try {
            await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content-scripts/content.js'] });
            await new Promise(resolve => setTimeout(resolve, 1000));
            response = await chrome.tabs.sendMessage(tab.id, { action: 'extractTranscript' });
          } catch (injectionError) {
            throw new Error('Failed to inject content script. Please refresh the YouTube page and try again.');
          }
        } else {
          throw err;
        }
      }
      if (!response) throw new Error('No response from content script. The extension may not be properly injected.');
      if (response.error) throw new Error(response.error);
      if (!response.transcript) throw new Error('No transcript found. Please make sure you are on a YouTube video page with available transcripts.');
      setTranscriptResult(response);
      updateProgress(50, 'Transcript extracted successfully!');
      if (apiKey) await generateSummary(response.transcript);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
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
      const summary = await invokeAI(aiService, transcript, customPrompt, apiKey);
      setSummary(summary);
      updateProgress(100, 'Summary generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to generate summary: ${errorMessage}`);
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

  return (
    <Box sx={{ width: 600, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>YouTube Transcript Summarizer</Typography>
        <IconButton onClick={() => setShowHelp(true)}><HelpIcon /></IconButton>
        <IconButton onClick={() => setShowSettings(true)}><SettingsIcon /></IconButton>
      </Box>
      <StatusBar isLoading={isLoading} status={status} progress={progress} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <MainActions
        onExtract={extractTranscript}
        isLoading={isLoading}
        transcriptResult={transcriptResult}
        onExtractNew={() => { setTranscriptResult(null); setSummary(''); setStatus(''); setProgress(0); }}
      />
      {transcriptResult && transcriptResult.transcript && (
        <TranscriptPanel transcript={transcriptResult.transcript} onCopy={copyTranscript} videoTitle={transcriptResult.videoTitle} />
      )}
      {summary && (
        <SummaryPanel summary={summary} onCopy={copySummary} />
      )}
      <SettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        aiService={aiService}
        apiKey={apiKey}
        customPrompt={customPrompt}
        onAiServiceChange={(v: string) => setAiService(v as AIServiceType)}
        onApiKeyChange={setApiKey}
        onCustomPromptChange={setCustomPrompt}
        onSave={saveSettings}
      />
      <HelpDialog open={showHelp} onClose={() => setShowHelp(false)} openUrl={openUrl} />
      <Snackbar open={showSaveNotification} autoHideDuration={3000} onClose={() => setShowSaveNotification(false)} message="Settings saved successfully!" action={<IconButton size="small" color="inherit"><CheckIcon /></IconButton>} />
      <Snackbar open={showCopied} autoHideDuration={2000} onClose={() => setShowCopied(false)} message="Copied to clipboard!" action={<IconButton size="small" color="inherit"><CheckIcon /></IconButton>} />
    </Box>
  );
};

export default App;
