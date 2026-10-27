import localFont from 'next/font/local'

// Built by scripts/fonts/subset.py. next/font reads these options at build time, so every value is
// written out literally. One family per module: a page preloads only the fonts its imports reach.

export const eczar = localFont({
  src: [{ path: './eczar/Eczar.woff2', style: 'normal', weight: '400 800' }],
  variable: '--font-eczar',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: 'unicode-range', value: 'U+0900-097F, U+1CD0-1CFF, U+200C-200D, U+25CC, U+A8E0-A8FF' }],
})
