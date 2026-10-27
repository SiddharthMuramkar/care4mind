import localFont from 'next/font/local'

// Built by scripts/fonts/subset.py. next/font reads these options at build time, so every value is
// written out literally. One family per module: a page preloads only the fonts its imports reach.

export const playfair = localFont({
  src: [
    { path: './playfair/Playfair.woff2', style: 'normal', weight: '300 900' },
    { path: './playfair/Playfair-Italic.woff2', style: 'italic', weight: '300 900' },
  ],
  variable: '--font-playfair',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})
