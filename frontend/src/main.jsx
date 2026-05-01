import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './theme.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3. Wrap the entire App in the ThemeProvider */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline automatically applies background color and fixes default browser margins */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);