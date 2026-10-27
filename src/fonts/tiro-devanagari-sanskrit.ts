import localFont from 'next/font/local'

// Built by scripts/fonts/subset.py: Devanagari only. It is declared with a unicode-range and
// never preloaded, so pages without Devanagari never download it. It is optional (ticket 05):
// used only if it is there within about a tenth of a second, as it is once cached, so it never
// swaps in late and moves the text.

export const tiroDevanagariSanskrit = localFont({
  src: [
    {
      path: './tiro-devanagari-sanskrit/TiroDevanagariSanskrit-Regular.woff2',
      style: 'normal',
      weight: '400',
    },
  ],
  variable: '--font-tiro',
  display: 'optional',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'unicode-range', value: 'U+0900-097F, U+1CD0-1CFF, U+200C-200D, U+25CC, U+A8E0-A8FF' },
    // Tiro's Devanagari runs large beside Playfair; ticket 07 measured about 87%.
    { prop: 'size-adjust', value: '87%' },
  ],
})
