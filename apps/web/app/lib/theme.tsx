import { createTheme } from '@mui/material';

export const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: ['"Fira Mono"', 'monospace'].join(','),
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff00',
    },
  },
});
