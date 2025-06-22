import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface TranscriptPanelProps {
  transcript: string;
  onCopy: () => void;
  videoTitle?: string;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcript, onCopy, videoTitle }) => (
  <Paper sx={{ p: 2, mb: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 1 }}>Transcript{videoTitle ? `: ${videoTitle}` : ''}</Typography>
    <Box
      sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1, cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
      onClick={onCopy}
    >
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{transcript}</Typography>
    </Box>
    <Typography variant="caption" color="text.secondary">Click to copy transcript</Typography>
  </Paper>
);

export default TranscriptPanel; 