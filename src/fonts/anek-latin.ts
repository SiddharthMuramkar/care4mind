import localFont from 'next/font/local'

// Built by scripts/fonts/subset.py. next/font reads these options at build time, so every value is
// written out literally. One family per module: a page preloads only the fonts its imports reach.

export const anekLatin = localFont({
  src: [{ path: './anek-latin/AnekLatin.woff2', style: 'normal', weight: '100 800' }],
  variable: '--font-anek-latin',
  display: 'swap',
  adjustFontFallback: 'Arial',
})
