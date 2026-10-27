import localFont from 'next/font/local'

// Built by scripts/fonts/subset.py. next/font reads these options at build time, so every value is
// written out literally. One family per module: a page preloads only the fonts its imports reach.

export const tiroDevanagariSanskrit = localFont({
  src: [
    { path: './tiro-devanagari-sanskrit/TiroDevanagariSanskrit.woff2', style: 'normal', weight: '400' },
    { path: './tiro-devanagari-sanskrit/TiroDevanagariSanskrit-Italic.woff2', style: 'italic', weight: '400' },
  ],
  variable: '--font-tiro',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'unicode-range', value: 'U+0900-097F, U+1CD0-1CFF, U+200C-200D, U+25CC, U+A8E0-A8FF' },
    // Tiro's Devanagari runs large beside Playfair; ticket 07 measured about 87%.
    { prop: 'size-adjust', value: '87%' },
  ],
})
