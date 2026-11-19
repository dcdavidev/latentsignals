import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Divider,
  Paper,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material';

import './app.css';

import type { Route } from './+types/root';
import { theme } from './lib/theme.js';

export const meta: Route.MetaFunction = () => [
  { title: 'Latent Signals' },
  {
    name: 'description',
    content:
      'Signals not yet decoded or travelling under the radar across the network.',
  },
  { name: 'theme-color', content: '#000000' },
  { name: 'application-name', content: 'Latent Signals' },
  { name: 'apple-mobile-web-app-title', content: 'Latent Signals' },
  { name: 'apple-mobile-web-app-capable', content: 'yes' },
  { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
];

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/favicon-16x16.png',
  },
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/apple-touch-icon.png',
  },
  { rel: 'manifest', href: '/site.webmanifest' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let is404 = false;
  let statusText = 'Error';
  let message = 'Transmission Interrupted';
  let details = 'An unexpected error occurred within the network.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    is404 = error.status === 404;
    statusText = `${error.status} ${error.statusText || (is404 ? 'Not Found' : 'Error')}`;
    message = is404 ? 'Signal Not Found' : 'Gateway Error';
    details = is404
      ? 'The requested endpoint does not exist or has drifted under the radar.'
      : error.data?.message || error.statusText || details;
  } else if (error instanceof Error) {
    message = error.name || 'Runtime Exception';
    details = error.message;
    if (import.meta.env.DEV) {
      stack = error.stack;
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={is404 ? '404 • UNRESOLVED POINTER' : statusText}
              color={is404 ? 'warning' : 'error'}
              variant="outlined"
              size="small"
              sx={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
            />
          </Box>

          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
            >
              {message}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}
            >
              {details}
            </Typography>
          </Box>

          <Alert
            severity={is404 ? 'warning' : 'error'}
            variant="outlined"
            sx={{
              borderRadius: 2,
              fontFamily: 'var(--font-mono)',
              '& .MuiAlert-message': { width: '100%' },
            }}
          >
            <AlertTitle
              sx={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
            >
              {is404 ? 'Routing Trace' : 'Exception Trace'}
            </AlertTitle>
            {is404
              ? 'No incoming socket or route handler responded to this path.'
              : details}
          </Alert>

          {stack && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                }}
              >
                Diagnostic Stack Trace (Development Only)
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                  borderRadius: 2,
                  overflowX: 'auto',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography
                  component="pre"
                  variant="caption"
                  sx={{
                    fontFamily: 'var(--font-mono)',
                    m: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {stack}
                </Typography>
              </Paper>
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <Button
              component={Link}
              to="/"
              variant="contained"
              disableElevation
              sx={{
                fontFamily: 'var(--font-mono)',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Return to Core
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                if (globalThis.window !== undefined) {
                  globalThis.location.reload();
                }
              }}
              sx={{
                fontFamily: 'var(--font-mono)',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Retry Connection
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
