import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // 1. Tell MUI this is a Dark Theme. It will automatically change default text to white (#FFFFFF)
    mode: 'dark', 
    
    primary: {
      main: '#9FFF98', // Your new Neon Green
      contrastText: '#0E0E0E', // Forces text inside the green buttons to be dark for readability
    },
    background: {
      default: '#0E0E0E', // Your new Deep Black background
      paper: '#1A1A1A', // A slightly lighter black for UI cards to stand out against the background
    },
  },
  typography: {
    // 2. Prioritize your selected font, keeping standard web fonts as fallbacks
    fontFamily: '"SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // Modern designs usually don't force ALL CAPS on buttons
      fontWeight: 500,
    }
  },
  shape: {
    borderRadius: 12, // The cards in your design have softer, rounded corners
  }
});

export default theme;