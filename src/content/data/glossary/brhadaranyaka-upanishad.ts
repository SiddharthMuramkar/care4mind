import { defineGlossaryEntry } from '@/content/schema'

// Two spellings on the page; the second card says it is another spelling.
export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'brhadaranyaka-upanishad',
  name: { ascii: 'Brhadaranyaka Upanishad', devanagari: 'बृहदारण्यकोपनिषद्' },
  definition: 'One of the oldest Upanishads discussing self-knowledge and liberation.',
  url: 'https://dharmawiki.org/index.php/Brhadaranyaka_Upanishad_(%E0%A4%AC%E0%A5%83%E0%A4%B9%E0%A4%A6%E0%A4%BE%E0%A4%B0%E0%A4%A3%E0%A5%8D%E0%A4%AF%E0%A4%95%E0%A5%8B%E0%A4%AA%E0%A4%A8%E0%A4%BF%E0%A4%B7%E0%A4%A6%E0%A5%8D)',
  provenance: {
    sources: [{ url: 'https://care4mind.org/concepts/', retrieved: '2026-10-27' }],
    edits: [
      'Interface text dropped: the link label “Click to learn more”; the link is the entry’s url.',
      'Merged into this entry: the card “Brihadaranyaka Upanishad (बृहदारण्यक उपनिषद्)”, whose description, “Another spelling for Brhadaranyaka Upanishad.”, says it is another spelling of this one. Its spelling, “Brihadaranyaka Upanishad”, and Devanagari, “बृहदारण्यक उपनिषद्”, are listed here; its link, https://dharmawiki.org/index.php/Brihadaranyaka_Upanishad_(%E0%A4%AC%E0%A5%83%E0%A4%B9%E0%A4%A6%E0%A4%BE%E0%A4%B0%E0%A4%A3%E0%A5%8D%E0%A4%AF%E0%A4%95_%E0%A4%89%E0%A4%AA%E0%A4%A8%E0%A4%BF%E0%A4%B7%E0%A4%A6%E0%A5%8D), is dropped.',
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
