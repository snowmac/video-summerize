import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, Alert } from '@mui/material';
import { Help as HelpIcon, ExpandMore as ExpandMoreIcon, Key as KeyIcon, Link as LinkIcon, AccountCircle as AccountIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
  openUrl: (url: string) => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose, openUrl }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <HelpIcon style={{ marginRight: 8 }} /> How to Get API Keys
      </span>
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
    <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
  </Dialog>
);

export default HelpDialog; 