import { defineGlossaryEntry } from '@/content/schema'

// The card types an ASCII colon for the visarga.
export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'purushartha',
  name: { ascii: 'Purushartha', devanagari: 'पुरुषार्थः' },
  definition: 'The four goals of human life: Dharma, Artha, Kama, and Moksha.',
  url: 'https://dharmawiki.org/index.php/Purushartha_(%E0%A4%AA%E0%A5%81%E0%A4%B0%E0%A5%81%E0%A4%B7%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%A5:)',
  provenance: {
    sources: [{ url: 'https://care4mind.org/concepts/', retrieved: '2026-10-27' }],
    edits: [
      'Interface text dropped: the link label “Click to learn more”; the link is the entry’s url.',
      'The card’s heading, “Purushartha (पुरुषार्थ:”, has no closing bracket; it is split into the name and the Devanagari.',
      'Visarga fixed, where the card typed an ASCII colon: “पुरुषार्थ:” → “पुरुषार्थः”.',
      'The page around the cards is not carried over: its image (D18), its heading “Categories”, its letter tabs, and the note “No information available at this time.” under each letter with no cards (D, E, F, H, L, O, Q, W, X, Y and Z).',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The card writes the Devanagari “पुरुषार्थ:”, with an ASCII colon where the visarga goes; the entry writes “पुरुषार्थः”. Its link, kept exactly as the card has it, ends with the colon too. Confirm. Nothing was looked up.',
        ticket: 15,
      },
      {
        for: 'project-owner',
        note: 'Glossary descriptions, taken from the cards on the current /concepts/ page, may be adapted from DharmaWiki, the site each card links to. Decide whether they may be used, and how DharmaWiki is credited. Nothing was looked up.',
      },
    ],
  },
})
