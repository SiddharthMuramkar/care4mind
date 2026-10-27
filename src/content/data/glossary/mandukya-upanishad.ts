import { defineGlossaryEntry } from '@/content/schema'

export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'mandukya-upanishad',
  name: { ascii: 'Mandukya Upanishad', devanagari: 'माण्डूक्य उपनिषद्' },
  definition: 'An Upanishad explaining the four states of consciousness.',
  url: 'https://dharmawiki.org/index.php/Mandukya_Upanishad_(%E0%A4%AE%E0%A4%BE%E0%A4%A3%E0%A5%8D%E0%A4%A1%E0%A5%82%E0%A4%95%E0%A5%8D%E0%A4%AF_%E0%A4%89%E0%A4%AA%E0%A4%A8%E0%A4%BF%E0%A4%B7%E0%A4%A6%E0%A5%8D)',
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
