import type { LateFace } from './late-faces'
import tiro from './tiro-devanagari-sanskrit/TiroDevanagariSanskrit-Regular.woff2' with { turbopackModuleType: 'asset' }

// Built by scripts/fonts/subset.py: Devanagari only, about 110 kB. It is added once the page's
// text is painted (ticket 05), and only pages with Devanagari fetch it. Until then that text is
// set in a system font, with the same line height (globals.css), so the swap moves nothing.

export const tiroDevanagariSanskrit: LateFace = {
  // The name globals.css gives --font-tiro.
  family: 'tiroDevanagariSanskrit',
  url: tiro,
  onDemand: true,
  descriptors: {
    style: 'normal',
    weight: '400',
    display: 'swap',
    unicodeRange: 'U+0900-097F, U+1CD0-1CFF, U+200C-200D, U+25CC, U+A8E0-A8FF',
    // Tiro's Devanagari runs large beside Playfair; ticket 07 measured about 87%.
    sizeAdjust: '87%',
  },
}
