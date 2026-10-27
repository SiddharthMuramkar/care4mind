import localFont from 'next/font/local'

// Built by scripts/fonts/subset.py: static cuts of Playfair, about 65 kB each, covering IAST
// and the ISO 15919 marks. next/font reads these options at build time, so every value is
// written out literally.

/** Running text: small optical size, sturdy and low in contrast. */
export const playfairText = localFont({
  src: [
    { path: './playfair/PlayfairText-Regular.woff2', style: 'normal', weight: '400' },
    { path: './playfair/PlayfairText-Italic.woff2', style: 'italic', weight: '400' },
    { path: './playfair/PlayfairText-SemiBold.woff2', style: 'normal', weight: '600' },
  ],
  variable: '--font-playfair-text',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})

/** Headings: a large optical size, high in contrast. */
export const playfairDisplay = localFont({
  src: [{ path: './playfair/PlayfairDisplay-Medium.woff2', style: 'normal', weight: '500' }],
  variable: '--font-playfair-display',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})
