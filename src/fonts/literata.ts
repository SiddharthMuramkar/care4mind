import localFont from 'next/font/local'

// Built by scripts/fonts/subset.py. next/font reads these options at build time, so every value is
// written out literally. One family per module: a page preloads only the fonts its imports reach.

export const literata = localFont({
  src: [
    { path: './literata/Literata.woff2', style: 'normal', weight: '200 900' },
    { path: './literata/Literata-Italic.woff2', style: 'italic', weight: '200 900' },
  ],
  variable: '--font-literata',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})
