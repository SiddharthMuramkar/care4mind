import { defineGlossaryEntry } from '@/content/schema'

export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'jivanmukta',
  name: { ascii: 'Jivanmukta', devanagari: 'जीवन्मुक्तः' },
  definition: 'A liberated being who attains freedom while still alive.',
  url: 'https://dharmawiki.org/index.php/Jivanmukta_(%E0%A4%9C%E0%A5%80%E0%A4%B5%E0%A4%A8%E0%A5%8D%E0%A4%AE%E0%A5%81%E0%A4%95%E0%A5%8D%E0%A4%A4%E0%A4%83)',
  provenance: {
    sources: [{ url: 'https://care4mind.org/concepts/', retrieved: '2026-10-27' }],
    edits: [
      'Interface text dropped: the link label “Click to learn more”; the link is the entry’s url.',
      'The page around the cards is not carried over: its image (D18), its heading “Categories”, its letter tabs, and the note “No information available at this time.” under each letter with no cards (D, E, F, H, L, O, Q, W, X, Y and Z).',
    ],
    flags: [
      {
        for: 'project-owner',
        note: 'Glossary descriptions, taken from the cards on the current /concepts/ page, may be adapted from DharmaWiki, the site each card links to. Decide whether they may be used, and how DharmaWiki is credited. Nothing was looked up.',
      },
    ],
  },
})
