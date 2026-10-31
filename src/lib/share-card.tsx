import { ImageResponse } from 'next/og'

import { site as config } from '@/config/site'
import { cardFaces } from '@/fonts/card-faces'
import { shareCardText } from '@/lib/metadata'

/** The size every share card is drawn at: the one WhatsApp, LinkedIn and X all crop well. */
export const CARD_SIZE = { width: 1200, height: 630 }

/** Press, in paper. Satori cannot read CSS variables, so a unit test keeps these equal to the tokens. */
export const CARD_COLOURS = {
  '--color-surface': '#eadbb6',
  '--color-surface-ink': '#1d1a2e',
  '--color-surface-muted': '#5a4a2e',
  '--color-surface-rule': '#8c7a55',
}
const PAPER = CARD_COLOURS['--color-surface']
const INK = CARD_COLOURS['--color-surface-ink']
const MUTED = CARD_COLOURS['--color-surface-muted']
const RULE = CARD_COLOURS['--color-surface-rule']

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
