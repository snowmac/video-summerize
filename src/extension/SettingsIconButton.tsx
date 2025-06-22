import React from 'react';
import { IconButton } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

interface SettingsIconButtonProps {
  onClick: () => void;
}

const SettingsIconButton: React.FC<SettingsIconButtonProps> = ({ onClick }) => (
  <IconButton onClick={onClick}>
    <SettingsIcon />
  </IconButton>
);

export default SettingsIconButton; 