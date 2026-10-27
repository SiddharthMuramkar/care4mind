import { defineGlossaryEntry } from '@/content/schema'

export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'sadhana-and-indian-psychology',
  name: { ascii: 'Sadhana and Indian Psychology', devanagari: 'साधनं मनोविज्ञानं च' },
  definition: 'The psychological dimensions of spiritual practice.',
  url: 'https://dharmawiki.org/index.php/Sadhana_and_Indian_Psychology_(%E0%A4%B8%E0%A4%BE%E0%A4%A7%E0%A4%A8%E0%A4%82_%E0%A4%AE%E0%A4%A8%E0%A5%8B%E0%A4%B5%E0%A4%BF%E0%A4%9C%E0%A5%8D%E0%A4%9E%E0%A4%BE%E0%A4%A8%E0%A4%82_%E0%A4%9A)',
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
