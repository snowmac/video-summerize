import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { Save as SaveIcon, Settings as SettingsIcon } from '@mui/icons-material';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  aiService: string;
  apiKey: string;
  customPrompt: string;
  onAiServiceChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onCustomPromptChange: (value: string) => void;
  onSave: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose, aiService, apiKey, customPrompt, onAiServiceChange, onApiKeyChange, onCustomPromptChange, onSave }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>
      <Typography variant="h6">Settings</Typography>
      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><SettingsIcon /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>AI Service</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>AI Service</InputLabel>
        <Select value={aiService} onChange={e => onAiServiceChange(e.target.value)} label="AI Service">
          <MenuItem value="openai">OpenAI GPT-4</MenuItem>
          <MenuItem value="anthropic">Anthropic Claude</MenuItem>
          <MenuItem value="grok">xAI Grok</MenuItem>
          <MenuItem value="huggingface">Hugging Face (Free)</MenuItem>
        </Select>
      </FormControl>
      <TextField fullWidth label="API Key" type="password" value={apiKey} onChange={e => onApiKeyChange(e.target.value)} margin="normal" helperText="Your API key will be stored securely in browser storage" />
      <TextField fullWidth label="Custom Prompt" multiline rows={4} value={customPrompt} onChange={e => onCustomPromptChange(e.target.value)} margin="normal" helperText="Customize how the AI should summarize the transcript" />
    </DialogContent>
    <DialogActions>
      <Button fullWidth variant="contained" onClick={onSave} startIcon={<SaveIcon />}>Save Settings</Button>
    </DialogActions>
  </Dialog>
);

export default SettingsDialog; 