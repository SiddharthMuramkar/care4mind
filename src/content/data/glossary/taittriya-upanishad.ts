import { defineGlossaryEntry } from '@/content/schema'

export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'taittriya-upanishad',
  name: { ascii: 'Taittriya Upanishad', devanagari: 'तैत्तिरीय-उपनिषद्' },
  definition: 'An Upanishad exploring the nature of Brahman and bliss.',
  url: 'https://dharmawiki.org/index.php/Taittriya_Upanishad_(%E0%A4%A4%E0%A5%88%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%BF%E0%A4%B0%E0%A5%80%E0%A4%AF-%E0%A4%89%E0%A4%AA%E0%A4%A8%E0%A4%BF%E0%A4%B7%E0%A4%A6%E0%A5%8D)',
  provenance: {
    sources: [{ url: 'https://care4mind.org/concepts/', retrieved: '2026-10-27' }],
    edits: [
      'Interface text dropped: the link label “Click to learn more”; the link is the entry’s url.',
      'The page around the cards is not carried over: its image (D18), its heading “Categories”, its letter tabs, and the note “No information available at this time.” under each letter with no cards (D, E, F, H, L, O, Q, W, X, Y and Z).',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The card spells the name “Taittriya Upanishad”, and so does its link, while its Devanagari reads “तैत्तिरीय-उपनिषद्”. Kept as the card has it, and the slug follows it; confirm the spelling. Nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'project-owner',
        note: 'Glossary descriptions, taken from the cards on the current /concepts/ page, may be adapted from DharmaWiki, the site each card links to. Decide whether they may be used, and how DharmaWiki is credited. Nothing was looked up.',
      },
    ],
  },
})
