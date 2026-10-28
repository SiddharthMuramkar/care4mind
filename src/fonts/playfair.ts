import localFont from 'next/font/local'

import type { LateFace } from './late-faces'
import displayMedium from './playfair/PlayfairDisplay-Medium.woff2' with { turbopackModuleType: 'asset' }
import italic from './playfair/PlayfairText-Italic.woff2' with { turbopackModuleType: 'asset' }
import semiBold from './playfair/PlayfairText-SemiBold.woff2' with { turbopackModuleType: 'asset' }

// Built by scripts/fonts/subset.py: static cuts of Playfair covering IAST and the ISO 15919
// marks. next/font reads these options at build time, so every value is written out literally.
//
// Only Text Regular, which sets most of each page, loads with it, preloaded. The other cuts are
// added once its text is painted (ticket 05).

/** Running text: small optical size, sturdy and low in contrast. */
export const playfairText = localFont({
  src: [{ path: './playfair/PlayfairText-Regular.woff2', style: 'normal', weight: '400' }],
  variable: '--font-playfair-text',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})

// The family next/font gave the regular, which the italic and semibold join.
const family = playfairText.style.fontFamily.split(',')[0]?.replace(/['"]/g, '').trim() ?? ''

/** The italic and semibold of running text. */
export const playfairTextStyles: LateFace[] = [
  { family, url: italic, descriptors: { style: 'italic', weight: '400', display: 'swap' } },
  { family, url: semiBold, descriptors: { style: 'normal', weight: '600', display: 'swap' } },
]

/** Headings: a large optical size, high in contrast. Until it arrives they are set in Text Regular. */
export const playfairDisplay: LateFace = {
  // The name globals.css gives --font-playfair-display.
  family: 'playfairDisplay',
  url: displayMedium,
  onDemand: true,
  descriptors: { style: 'normal', weight: '500', display: 'swap' },
}
