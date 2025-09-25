// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Enable dark mode globally
    background: {
      default: '#121212', // dark grey-black for page background
      paper: '#1e1e1e',   // cards and paper background
    },
    primary: {
      main: '#1976d2', // This is the default MUI blue color for primary (used by AppBar)
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#1976d2', // Force AppBar background blue
        },
      },
    },
  },
});

export default theme;
