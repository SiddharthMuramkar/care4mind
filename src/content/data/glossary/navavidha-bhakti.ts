import { defineGlossaryEntry } from '@/content/schema'

// Its card carries the Mundaka Upanishad card’s description: left out.
export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'navavidha-bhakti',
  name: { ascii: 'Navavidha Bhakti', devanagari: 'नवविधाभक्तिः' },
  url: 'https://dharmawiki.org/index.php/Navavidha_Bhakti_(%E0%A4%A8%E0%A4%B5%E0%A4%B5%E0%A4%BF%E0%A4%A7%E0%A4%BE%E0%A4%AD%E0%A4%95%E0%A5%8D%E0%A4%A4%E0%A4%BF%E0%A4%83)',
  provenance: {
    sources: [{ url: 'https://care4mind.org/concepts/', retrieved: '2026-10-27' }],
    edits: [
      'Interface text dropped: the link label “Click to learn more”; the link is the entry’s url.',
      'Description left out: the card’s is the Mundaka Upanishad card’s, word for word, and doesn’t describe this term: “An Upanishad emphasizing renunciation and self-knowledge.” → “”. The entry keeps its name and link.',
      'The page around the cards is not carried over: its image (D18), its heading “Categories”, its letter tabs, and the note “No information available at this time.” under each letter with no cards (D, E, F, H, L, O, Q, W, X, Y and Z).',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The card’s description, “An Upanishad emphasizing renunciation and self-knowledge.”, is the Mundaka Upanishad card’s, word for word, and doesn’t describe Navavidha Bhakti. It is left out, so the entry has a name and a link and no description. Nothing was looked up.',
      },
      {
        for: 'project-owner',
        note: 'Glossary descriptions, taken from the cards on the current /concepts/ page, may be adapted from DharmaWiki, the site each card links to. Decide whether they may be used, and how DharmaWiki is credited. Nothing was looked up.',
      },
    ],
  },
})
