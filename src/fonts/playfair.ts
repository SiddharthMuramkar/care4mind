import localFont from 'next/font/local'

// Built by scripts/fonts/subset.py: static cuts of Playfair, about 65 kB each, covering IAST
// and the ISO 15919 marks. next/font reads these options at build time, so every value is
// written out literally.
//
// Only the two cuts that set most of each page, Text Regular and Display Medium, are preloaded.
// The italic and semibold load once the page's text asks for them (ticket 05).

/** Running text: small optical size, sturdy and low in contrast. */
export const playfairText = localFont({
  src: [{ path: './playfair/PlayfairText-Regular.woff2', style: 'normal', weight: '400' }],
  variable: '--font-playfair-text',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
  declarations: [{ prop: 'font-family', value: 'playfairText' }],
})

/**
 * The italic and semibold of running text. A call preloads all its files or
 * none, so they have a call of their own, named into the family above; they
 * need no class or variable, as importing this module brings them in.
 */
export const playfairTextStyles = localFont({
  src: [
    { path: './playfair/PlayfairText-Italic.woff2', style: 'italic', weight: '400' },
    { path: './playfair/PlayfairText-SemiBold.woff2', style: 'normal', weight: '600' },
  ],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: 'font-family', value: 'playfairText' }],
})

/** Headings: a large optical size, high in contrast. */
export const playfairDisplay = localFont({
  src: [{ path: './playfair/PlayfairDisplay-Medium.woff2', style: 'normal', weight: '500' }],
  variable: '--font-playfair-display',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})
