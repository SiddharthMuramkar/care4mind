import { ImageResponse } from 'next/og'

import { site as config } from '@/config/site'
import { cardFaces } from '@/fonts/card-faces'
import { shareCardText } from '@/lib/metadata'

/** The size every share card is drawn at: the one WhatsApp, LinkedIn and X all crop well. */
export const CARD_SIZE = { width: 1200, height: 630 }

// Press, in paper: the same values as --color-surface, --color-surface-ink and --color-surface-rule.
const PAPER = '#eadbb6'
const INK = '#1d1a2e'
const MUTED = '#5a4a2e'
const RULE = '#8c7a55'

/**
 * The share card of the public page whose route pattern is `pattern` (with `slug` in its
 * `[slug]`): ink on paper, the site's name over a rule, then the page's name and its summary.
 */
export async function shareCard(pattern: string, slug = ''): Promise<ImageResponse> {
  const { title, description } = await shareCardText(pattern.replace('[slug]', slug))
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '64px 80px',
        background: PAPER,
        color: INK,
        fontFamily: 'Playfair Text, Tiro Devanagari Sanskrit',
      }}
    >
      <div style={{ fontSize: 32, color: MUTED, letterSpacing: 2 }}>{config.name}</div>
      <div style={{ height: 2, background: RULE, marginTop: 20, marginBottom: 56 }} />
      <div
        style={{
          fontFamily: 'Playfair Display, Tiro Devanagari Sanskrit',
          fontWeight: 500,
          fontSize: title.length > 40 ? 64 : 80,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 32,
          fontSize: 32,
          lineHeight: 1.4,
          color: MUTED,
          display: 'block',
          lineClamp: 3,
        }}
      >
        {description}
      </div>
    </div>,
    { ...CARD_SIZE, fonts: await cardFaces() },
  )
}
