import React from 'react';
import { IconButton } from '@mui/material';
import { Help as HelpIcon } from '@mui/icons-material';

interface HelpIconButtonProps {
  onClick: () => void;
}

const HelpIconButton: React.FC<HelpIconButtonProps> = ({ onClick }) => (
  <IconButton onClick={onClick}>
    <HelpIcon />
  </IconButton>
);

export default HelpIconButton; 