import { defineGlossaryEntry } from '@/content/schema'

// Two cards on the page with the same description; this keeps the first.
export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'upanishads',
  name: { ascii: 'Upanishads', devanagari: 'उपनिषदः' },
  definition: 'Philosophical scriptures exploring the nature of reality and self.',
  url: 'https://dharmawiki.org/index.php/Upanishads_(%E0%A4%89%E0%A4%AA%E0%A4%A8%E0%A4%BF%E0%A4%B7%E0%A4%A6%E0%A4%83)',
  provenance: {
    sources: [{ url: 'https://care4mind.org/concepts/', retrieved: '2026-10-27' }],
    edits: [
      'Interface text dropped: the link label “Click to learn more”; the link is the entry’s url.',
      'Merged: the page has two “Upanishads” cards with the same description, “Upanishads (उपनिषदः)” and “Upanishads (उपनिषद्)”. The entry keeps the first card’s Devanagari and link; the second card’s Devanagari, “उपनिषद्”, and its link, https://dharmawiki.org/index.php/Upanishads_(%E0%A4%89%E0%A4%AA%E0%A4%A8%E0%A4%BF%E0%A4%B7%E0%A4%A6%E0%A5%8D), are dropped.',
      'The page around the cards is not carried over: its image (D18), its heading “Categories”, its letter tabs, and the note “No information available at this time.” under each letter with no cards (D, E, F, H, L, O, Q, W, X, Y and Z).',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page has two “Upanishads” cards with the same description: one writes “उपनिषदः”, the other “उपनिषद्”, and each links to its own DharmaWiki article. The entry keeps the first card’s Devanagari and link. Confirm which to keep. Nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'project-owner',
        note: 'Glossary descriptions, taken from the cards on the current /concepts/ page, may be adapted from DharmaWiki, the site each card links to. Decide whether they may be used, and how DharmaWiki is credited. Nothing was looked up.',
      },
    ],
  },
})
