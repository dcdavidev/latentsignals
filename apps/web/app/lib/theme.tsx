import { createTheme } from '@mui/material';

export const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: ['"Fira Mono"', 'monospace'].join(','),
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#593c8f',
      light: '#7a63a5',
      dark: '#3e2a64',
      contrastText: '#ffffff',
    },
  },
});
