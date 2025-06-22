import React from 'react';
import { Paper, Typography, Box, IconButton } from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import { marked } from 'marked';

interface SummaryPanelProps {
  summary: string;
  onCopy: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ summary, onCopy }) => (
  <Paper sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>AI Summary</Typography>
      <IconButton onClick={onCopy} size="small"><CopyIcon /></IconButton>
    </Box>
    <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1 }}
      dangerouslySetInnerHTML={{ __html: marked(summary) }}
    />
  </Paper>
);

export default SummaryPanel; 