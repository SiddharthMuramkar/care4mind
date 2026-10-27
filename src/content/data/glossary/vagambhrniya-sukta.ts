import { defineGlossaryEntry } from '@/content/schema'

export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'vagambhrniya-sukta',
  name: { ascii: 'Vagambhrniya Sukta', devanagari: 'वागाम्भृणीयसूक्तम्' },
  definition: 'A hymn celebrating the power of speech and wisdom.',
  url: 'https://dharmawiki.org/index.php/Vagambhrniya_Sukta_(%E0%A4%B5%E0%A4%BE%E0%A4%97%E0%A4%BE%E0%A4%AE%E0%A5%8D%E0%A4%AD%E0%A5%83%E0%A4%A3%E0%A5%80%E0%A4%AF%E0%A4%B8%E0%A5%82%E0%A4%95%E0%A5%8D%E0%A4%A4%E0%A4%AE%E0%A5%8D)',
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
