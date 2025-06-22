import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface StatusBarProps {
  isLoading: boolean;
  status: string;
  progress: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ isLoading, status, progress }) => (
  (isLoading || status) ? (
    <Box sx={{ mb: 2 }}>
      <LinearProgress variant={isLoading ? 'indeterminate' : 'determinate'} value={progress} sx={{ mb: 1 }} />
      <Typography variant="body2" color="text.secondary">{status}</Typography>
    </Box>
  ) : null
);

export default StatusBar; 