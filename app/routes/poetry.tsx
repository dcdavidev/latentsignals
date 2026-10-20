/**
 * poetry.tsx
 * ==========
 *
 * Dynamic route to inspect an individual poem and switch between its available language implementations.
 */

import { useState } from 'react';

import { Link, useSearchParams } from 'react-router';

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';

import { getPoetryBySlug } from '../lib/poetries.server';
import type { Route } from './+types/poetry';

/**
 * Generates metadata for the poetry view.
 *
 * @param args Route metadata arguments containing loaderData.
 * @returns Metadata array for document head.
 */
export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData?.poetry) {
    return [{ title: 'Poem Not Found • Latent Signals' }];
  }
  return [
    { title: `${loaderData.poetry.title} • Latent Signals` },
    {
      name: 'description',
      content:
        loaderData.poetry.description ||
        `Code poetry implementation for ${loaderData.poetry.title}.`,
    },
  ];
};

/**
 * Route loader fetching poetry detail by slug param.
 *
 * @param args Route loader arguments containing params.
 * @returns Object with poetry detail.
 */
export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response('Poetry slug required', { status: 400 });
  }

  const poetry = getPoetryBySlug(slug);
  if (!poetry) {
    throw new Response(`Poetry "${slug}" not found`, { status: 404 });
  }

  return { poetry };
}

/**
 * Formats byte size into human readable string.
 *
 * @param bytes Size in bytes.
 * @returns Formatted string (e.g. "1.9 KB").
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Poetry component displaying poem details, language switcher, and syntax-highlighted code.
 *
 * @param props Route component props with loader data.
 * @returns Rendered JSX element.
 */
export default function Poetry({ loaderData }: Route.ComponentProps) {
  const { poetry } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  // Active language ID from search params or default
  const activeLangId =
    searchParams.get('lang') && poetry.files[searchParams.get('lang') as string]
      ? (searchParams.get('lang') as string)
      : poetry.defaultLanguageId;

  const activeFile =
    poetry.files[activeLangId] ?? poetry.files[poetry.defaultLanguageId];

  /**
   * Handles switching the active programming language.
   *
   * @param newLangId Selected language identifier.
   */
  const handleLanguageChange = (newLangId: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('lang', newLangId);
        return next;
      },
      { replace: true }
    );
  };

  /**
   * Copies raw code of the currently selected language to clipboard.
   */
  const handleCopyCode = async () => {
    if (activeFile && globalThis.navigator?.clipboard) {
      await globalThis.navigator.clipboard.writeText(activeFile.rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 8 } }}>
      <Stack spacing={4}>
        {/* Navigation bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            component={Link}
            to="/"
            variant="text"
            color="inherit"
            sx={{
              fontFamily: 'var(--font-mono)',
              textTransform: 'none',
              fontWeight: 600,
              px: 0,
              '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
            }}
          >
            ← Back to Catalog
          </Button>

          <Chip
            label={poetry.packageName}
            size="small"
            variant="outlined"
            sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          />
        </Box>

        {/* Poem Header */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: { xs: 3, sm: 4 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            borderColor: 'divider',
          }}
        >
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                label="TRANSMISSION // ACTIVE"
                color="primary"
                variant="outlined"
                size="small"
                sx={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: 'var(--font-mono)' }}
              >
                {poetry.languages.length} available implementations
              </Typography>
            </Box>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                textTransform: 'capitalize',
                letterSpacing: '-0.02em',
              }}
            >
              {poetry.title}
            </Typography>

            {poetry.description && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontFamily: 'var(--font-mono)',
                  maxWidth: '75ch',
                  lineHeight: 1.7,
                }}
              >
                {poetry.description}
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Language Selection & Code Display */}
        {poetry.languages.length === 0 ? (
          <Alert severity="warning" variant="outlined">
            No source files found in package.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {/* Language Selector Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                }}
              >
                Select Implementation
              </Typography>

              <Tabs
                value={activeLangId}
                onChange={(_, val) => handleLanguageChange(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 36,
                  '& .MuiTabs-indicator': {
                    bgcolor: 'primary.main',
                    height: 2,
                  },
                  '& .MuiTab-root': {
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'none',
                    minHeight: 36,
                    py: 0.75,
                    px: 2,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                {poetry.languages.map((lang) => (
                  <Tab
                    key={lang.id}
                    value={lang.id}
                    label={`${lang.label} (${lang.extension})`}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Code Viewer Container */}
            {activeFile && (
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: 'divider',
                  bgcolor: '#0d1117',
                  overflow: 'hidden',
                }}
              >
                {/* Code Window Header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: { xs: 2, sm: 2.5 },
                    py: 1.25,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: '#161b22',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'primary.main',
                      }}
                    >
                      {activeFile.filename}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: 'var(--font-mono)' }}
                    >
                      •
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {activeFile.linesCount} lines
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: 'var(--font-mono)' }}
                    >
                      •
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {formatBytes(activeFile.byteSize)}
                    </Typography>
                  </Stack>

                  <Tooltip
                    title={copied ? 'Copied to clipboard!' : 'Copy raw code'}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleCopyCode}
                      sx={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        py: 0.25,
                        px: 1.5,
                        color: copied ? 'primary.main' : 'text.secondary',
                        borderColor: copied ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          color: 'primary.main',
                        },
                      }}
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </Button>
                  </Tooltip>
                </Box>

                {/* Highlighted Code Content */}
                <Box
                  sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    p: 0,
                    bgcolor: '#0d1117',
                  }}
                >
                  {/* Line numbers gutter */}
                  <Box
                    sx={{
                      userSelect: 'none',
                      py: 2,
                      px: 2,
                      textAlign: 'right',
                      color: '#484f58',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.6,
                      borderRight: 1,
                      borderColor: '#21262d',
                      bgcolor: '#0d1117',
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                    }}
                  >
                    {Array.from({ length: activeFile.linesCount }, (_, i) => (
                      <div key={i + 1}>{i + 1}</div>
                    ))}
                  </Box>

                  {/* Highlighted code */}
                  <Box
                    component="pre"
                    className="hljs"
                    sx={{
                      m: 0,
                      py: 2,
                      px: 2.5,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.6,
                      overflow: 'visible',
                      whiteSpace: 'pre',
                      width: '100%',
                    }}
                  >
                    <code
                      /* eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml */
                      dangerouslySetInnerHTML={{
                        __html: activeFile.highlightedHtml,
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            )}
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Footer info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Button
            component={Link}
            to="/"
            size="small"
            variant="text"
            color="inherit"
            sx={{
              fontFamily: 'var(--font-mono)',
              textTransform: 'none',
              fontSize: '0.75rem',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            ← View All Signals
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
