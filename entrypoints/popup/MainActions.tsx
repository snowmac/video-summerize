import React from 'react';
import { Button } from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';

interface MainActionsProps {
  onExtract: () => void;
  isLoading: boolean;
  transcriptResult: any;
  onExtractNew: () => void;
}

const MainActions: React.FC<MainActionsProps> = ({ onExtract, isLoading, transcriptResult, onExtractNew }) => (
  !transcriptResult ? (
    <Button
      fullWidth
      variant="contained"
      startIcon={<PlayIcon />}
      onClick={onExtract}
      disabled={isLoading}
      sx={{ mb: 2 }}
    >
      {isLoading ? 'Processing...' : 'Extract & Summarize'}
    </Button>
  ) : (
    <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={onExtractNew}>Extract New Transcript</Button>
  )
);

export default MainActions; 