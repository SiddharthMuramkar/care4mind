import { defineGlossaryEntry } from '@/content/schema'

export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'aila-gita',
  name: { ascii: 'Aila Gita', devanagari: 'ऐलगीता' },
  definition:
    'A philosophical discourse from the Markandeya Purana about King Ila’s spiritual realization.',
  url: 'https://dharmawiki.org/index.php/Aila_Gita_(%E0%A4%90%E0%A4%B2%E0%A4%97%E0%A5%80%E0%A4%A4%E0%A4%BE)',
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
