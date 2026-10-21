/**
 * poetry-og.tsx
 * =============
 *
 * Resource route generating dynamic Open Graph (OG) PNG images for poem routes.
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

import { getFiraMonoBold, getFiraMonoRegular } from '../lib/og-fonts.server';
import { getPoetryBySlug } from '../lib/poetries.server';
import type { Route } from './+types/poetry-og';

/**
 * Resource route loader that renders and returns an Open Graph PNG image for a poem.
 *
 * @param args Route loader arguments containing route parameters.
 * @returns Binary PNG Response.
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

  const fontBold = getFiraMonoBold();
  const fontRegular = getFiraMonoRegular();

  const svg = await satori(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0d12',
        padding: '64px',
        fontFamily: 'Fira Mono',
        border: '10px solid #161b22',
        position: 'relative',
      }}
    >
      {/* Top bar: terminal prompt and site name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#3fb950',
            }}
          />
          <span
            style={{
              color: '#7d8590',
              fontSize: '20px',
              letterSpacing: '1px',
            }}
          >
            {`~/signals/poetries/${poetry.slug}`}
          </span>
        </div>
        <div
          style={{
            color: '#3fb950',
            fontSize: '18px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 700,
          }}
        >
          LATENT SIGNALS
        </div>
      </div>

      {/* Center: Title & Description */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginTop: '30px',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            fontSize: '60px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.15,
            letterSpacing: '-1px',
            textTransform: 'capitalize',
          }}
        >
          {poetry.title}
        </div>
        <div
          style={{
            fontSize: '24px',
            color: '#8b949e',
            lineHeight: 1.5,
            maxHeight: '120px',
            overflow: 'hidden',
          }}
        >
          {poetry.description}
        </div>
      </div>

      {/* Bottom bar: Implementation languages & tag */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: '24px',
          borderTop: '1px solid #21262d',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {poetry.languages.map((lang) => (
            <div
              key={lang.id}
              style={{
                padding: '6px 14px',
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                fontSize: '17px',
                color: '#58a6ff',
              }}
            >
              {lang.label}
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: '18px',
            color: '#7d8590',
            letterSpacing: '1px',
          }}
        >
          code • systems • memory
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Fira Mono',
          data: fontBold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Fira Mono',
          data: fontRegular,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });
  const pngBuffer = resvg.render().asPng();

  return new Response(new Uint8Array(pngBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': String(pngBuffer.byteLength),
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
