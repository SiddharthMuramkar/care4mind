// Style tiles for ticket 21, Step 1. Deleted before the PR merges; the chosen
// palette moves into src/styles/globals.css.
import type { CSSProperties } from 'react'

import type { ColourToken } from '@/lib/contrast'

export type Palette = Record<ColourToken | 'line', string>

export interface Direction {
  slug: 'press' | 'chroma' | 'kolam'
  name: string
  tone: string
  pitch: string
  fonts: { display: string; text: string; devanagari: string; note: string }
  palette: Palette
  /** Decorative colours used only for imagery, never for text. */
  decorative: readonly { name: string; value: string }[]
  imagery: string
  motion: { scroll: string; click: string; feedback: string }
  wordmark: string
}

export const directions: readonly Direction[] = [
  {
    slug: 'press',
    name: 'Press',
    tone: 'Classical press',
    pitch:
      'A scholar’s edition: Sanskrit set the way the great Indian presses set it, on folio-like pages floating over a deep indigo ink. Serious and quiet, with a flash of turmeric and vermilion where you act.',
    fonts: {
      display: 'Playfair, at large optical sizes (high contrast)',
      text: 'Playfair, at small optical sizes (sturdy, low contrast)',
      devanagari: 'Tiro Devanagari Sanskrit, scaled to 87% to sit with Playfair',
      note: 'The only shortlisted pairing that spells all of IAST and ISO 15919 and stacks every rare conjunct. Tiro has no bold, so Devanagari headings stay at regular weight.',
    },
    palette: {
      ground: '#151a3d',
      ink: '#f3ecdc',
      'ink-muted': '#c9c2d8',
      link: '#f6c453',
      surface: '#eadbb6',
      'surface-ink': '#1d1a2e',
      'surface-muted': '#5a4a2e',
      'surface-focus': '#151a3d',
      accent: '#f0b429',
      'accent-ink': '#151a3d',
      highlight: '#c8342a',
      'highlight-ink': '#ffffff',
      focus: '#f6c453',
      line: '#3b4178',
    },
    decorative: [
      { name: 'Ink wash', value: '#232a5c' },
      { name: 'Vermilion', value: '#c8342a' },
    ],
    imagery:
      'Printer’s rules and ornaments drawn as fine line SVG: folio frames, a lotus-petal fleuron, verse numbers in Devanagari digits. No photographs.',
    motion: {
      scroll: 'Folio rules ink in from the centre as a section scrolls into view.',
      click: 'A Concept card lifts off the page and becomes the Concept’s title page.',
      feedback: 'Buttons press into the paper like type into a sheet (a quick deboss).',
    },
    wordmark: 'Care4Mind in Playfair at display size, with the 4 set as a vermilion roundel.',
  },
  {
    slug: 'chroma',
    name: 'Chroma',
    tone: 'Contemporary Indian',
    pitch:
      'Loud, warm and modern: block-print colour fields of rani pink, marigold, peacock and leaf, with a type family made in India whose width stretches from tall and narrow to wide and grounded.',
    fonts: {
      display: 'Anek Latin, wide and heavy',
      text: 'Anek Latin, normal width',
      devanagari: 'Anek Devanagari, from the same family',
      note: 'One family across both scripts, so Latin and Devanagari share a voice. It lacks ṝ and ḹ, and has no italic, so the browser slants it. The Devanagari file is the heaviest on the shortlist (252 kB).',
    },
    palette: {
      ground: '#fff6e6',
      ink: '#24123d',
      'ink-muted': '#5b4a6b',
      link: '#a3105a',
      surface: '#ffffff',
      'surface-ink': '#24123d',
      'surface-muted': '#5b4a6b',
      'surface-focus': '#006d63',
      accent: '#c2185b',
      'accent-ink': '#ffffff',
      highlight: '#ffb300',
      'highlight-ink': '#24123d',
      focus: '#006d63',
      line: '#24123d',
    },
    decorative: [
      { name: 'Peacock', value: '#00796b' },
      { name: 'Leaf', value: '#4c9a2a' },
      { name: 'Marigold', value: '#ffb300' },
    ],
    imagery:
      'Block-print bands and cut-paper shapes as SVG patterns: stepped diamonds, lotus marks and half-moons in flat colour.',
    motion: {
      scroll:
        'Pattern bands slide past each other as you scroll, like printing blocks on a moving cloth.',
      click: 'A tapped card floods with colour from the point you touched, then opens.',
      feedback: 'Cards and buttons answer a tap with a short spring.',
    },
    wordmark: 'CARE4MIND in wide, heavy Anek, the 4 knocked out of a pink block.',
  },
  {
    slug: 'kolam',
    name: 'Kolam',
    tone: 'Editorial and research',
    pitch:
      'A calm reading room for students and researchers. Paper, forest green and gold (a nod to the current site’s green-to-gold), with kolam line drawings that double as a picture of linked knowledge.',
    fonts: {
      display: 'Literata, at large optical sizes',
      text: 'Literata, at text sizes',
      devanagari: 'Eczar, lively and light (89 kB)',
      note: 'Literata was made for long reading. It has all of IAST but not the rare ISO 15919 marks. Eczar never sets IAST, because its own Latin lacks ṛ, ṣ and ḍ.',
    },
    palette: {
      ground: '#f3f5ef',
      ink: '#17251e',
      'ink-muted': '#45574c',
      link: '#1e4f8f',
      surface: '#ffffff',
      'surface-ink': '#17251e',
      'surface-muted': '#45574c',
      'surface-focus': '#1e4f8f',
      accent: '#1f6b45',
      'accent-ink': '#ffffff',
      highlight: '#e3c15a',
      'highlight-ink': '#17251e',
      focus: '#1e4f8f',
      line: '#c5d0c2',
    },
    decorative: [
      { name: 'Gold', value: '#c9a227' },
      { name: 'Leaf wash', value: '#dfe8d9' },
    ],
    imagery:
      'Kolam: a grid of dots with one unbroken line looping around them. The same drawing turns into a map of Concepts joined by threads.',
    motion: {
      scroll: 'The kolam line draws itself as you read down the page.',
      click:
        'A Concept card grows into the Concept’s heading; IAST and Devanagari swap places smoothly.',
      feedback: 'Links underline from left to right; buttons settle with a soft ease.',
    },
    wordmark: 'care4mind in Literata italic, beside a small kolam mark.',
  },
]

export function getDirection(slug: Direction['slug']): Direction {
  const direction = directions.find((candidate) => candidate.slug === slug)
  if (!direction) throw new Error(`unknown direction ${slug}`)
  return direction
}

/** The palette as CSS custom properties, set on the tile's root element. */
export function paletteStyle(palette: Palette): CSSProperties {
  return Object.fromEntries(
    Object.entries(palette).map(([token, value]) => [`--color-${token}`, value]),
  ) as CSSProperties
}
