import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const FullScreenSpinner = ({ size = 50 }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
};

export default FullScreenSpinner;


