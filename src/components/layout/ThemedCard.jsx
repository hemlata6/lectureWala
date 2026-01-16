import React from 'react';
import { Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * ThemedCard - A wrapper component that applies theme-aware styling to cards
 * Use this instead of plain div cards to ensure theme compatibility
 */
const ThemedCard = ({ 
  children, 
  className = '', 
  sx = {},
  variant = 'elevation',
  elevation = 1,
  onClick,
  ...props 
}) => {
  const theme = useTheme();

  return (
    <Card
      variant={variant}
      elevation={elevation}
      onClick={onClick}
      className={className}
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderTop: `3px solid ${theme.palette.primary.main}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderTopColor: theme.palette.primary.dark,
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default ThemedCard;
