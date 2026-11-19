/**
 * home.tsx
 * ========
 *
 * Home route: displays an alphabetical archive of all poetry packages in the monorepo.
 */

import { Link } from 'react-router';

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import { getAllPoetries } from '../lib/poetries.server';
import type { Route } from './+types/home';

/**
 * Page meta metadata.
 *
 * @returns Metadata array for the document head.
 */
export const meta: Route.MetaFunction = () => [
  { title: 'Latent Signals • Code Poetry Archive' },
  {
    name: 'description',
    content:
      'Catalog of code poems exploring systems, memory, concurrency, and signals.',
  },
];

/**
 * Route loader fetching all poetries sorted alphabetically.
 *
 * @returns Object with list of poetry summaries.
 */
export async function loader() {
  const poetries = getAllPoetries();
  return { poetries };
}

/**
 * Home component rendering alphabetical catalog of poems.
 *
 * @param props Route component props with loader data.
 * @returns Rendered JSX element.
 */
export default function Home({ loaderData }: Route.ComponentProps) {
  const { poetries } = loaderData;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 10 } }}>
      <Stack spacing={6}>
        {/* Hero Section */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 4 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                label="CATALOG // ALPHA ORDER"
                variant="outlined"
                size="small"
                color="primary"
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
                {poetries.length} {poetries.length === 1 ? 'signal' : 'signals'}{' '}
                indexed
              </Typography>
            </Box>

            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                textTransform: 'lowercase',
              }}
            >
              latent signals
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontFamily: 'var(--font-mono)',
                maxWidth: '65ch',
                lineHeight: 1.6,
              }}
            >
              Signals not yet decoded or travelling under the radar across the
              network. Executable poems expressed across multiple programming
              languages.
            </Typography>
          </Stack>
        </Box>

        {/* Alphabetical Poetry List */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
          }}
        >
          {poetries.map((poem, index) => {
            const indexFormatted = String(index + 1).padStart(2, '0');
            return (
              <Card
                key={poem.slug}
                variant="outlined"
                sx={{
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'border-color 0.2s, transform 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  to={`/poetries/${poem.slug}`}
                  sx={{ p: { xs: 2.5, sm: 3.5 }, height: '100%' }}
                >
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Stack spacing={2.5}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="primary.main"
                          sx={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                          }}
                        >
                          SIGNAL #{indexFormatted}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {poem.languages.length} languages
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="h5"
                          component="h2"
                          sx={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            mb: 0.5,
                          }}
                        >
                          {poem.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontFamily: 'var(--font-mono)',
                            display: 'block',
                          }}
                        >
                          {poem.packageName}
                        </Typography>
                      </Box>

                      {poem.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontFamily: 'var(--font-mono)',
                            lineHeight: 1.6,
                          }}
                        >
                          {poem.description}
                        </Typography>
                      )}

                      <Divider sx={{ my: 0.5 }} />

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontFamily: 'var(--font-mono)',
                            display: 'block',
                            mb: 1,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Available Runtimes
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.75,
                          }}
                        >
                          {poem.languages.map((lang) => (
                            <Chip
                              key={lang.id}
                              label={lang.label}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </Stack>
    </Container>
  );
}
