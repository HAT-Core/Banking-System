import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', 
    
    primary: {
      main: '#9FFF98', 
      contrastText: '#0E0E0E',
    },
    background: {
      default: '#0E0E0E', 
      paper: '#1A1A1A', 
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 500,
    }
  },
  shape: {
    borderRadius: 12,
  }
});

export default theme;