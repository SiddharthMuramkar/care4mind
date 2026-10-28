import { defineGlossaryEntry } from '@/content/schema'

// Two cards on the page: the description is the second card’s, the Devanagari and link the first’s.
export default defineGlossaryEntry({
  kind: 'glossary',
  slug: 'pravrtti-and-nivrtti',
  name: { ascii: 'Pravrtti and Nivrtti', devanagari: 'प्रवृत्ति और निवृत्ति' },
  definition: 'Pravṛtti is worldly action; Nivṛtti is renunciation.',
  url: 'https://dharmawiki.org/index.php/Pravrtti_and_Nivrtti_(%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%B5%E0%A5%83%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%BF_%E0%A4%94%E0%A4%B0_%E0%A4%A8%E0%A4%BF%E0%A4%B5%E0%A5%83%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%BF)',
  provenance: {
    sources: [{ url: 'https://care4mind.org/concepts/', retrieved: '2026-10-27' }],
    edits: [
      'Interface text dropped: the link label “Click to learn more”; the link is the entry’s url.',
      'Merged: the page has two “Pravrtti and Nivrtti” cards. The first, “Pravrtti and Nivrtti (प्रवृत्ति और निवृत्ति)”, carries Nishkama Karma’s description word for word and links to the Pravrtti and Nivrtti article; the second, “Pravrtti and Nivrtti (प्रवृत्तिः निवृत्तिः च)”, carries its own description and links to the Purusha article. The entry takes the first card’s Devanagari and link, and the second card’s description.',
      'The first card’s description dropped: “Selfless action performed without attachment to results.” → “”.',
      'The second card’s Devanagari, “प्रवृत्तिः निवृत्तिः च”, and its link, https://dharmawiki.org/index.php/Purusha_(%E0%A4%AA%E0%A5%81%E0%A4%B0%E0%A5%81%E0%A4%B7%E0%A4%83), dropped.',
      'The page around the cards is not carried over: its image (D18), its heading “Categories”, its letter tabs, and the note “No information available at this time.” under each letter with no cards (D, E, F, H, L, O, Q, W, X, Y and Z).',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page has two “Pravrtti and Nivrtti” cards: the first carries Nishkama Karma’s description and links to the Pravrtti and Nivrtti article; the second carries “Pravṛtti is worldly action; Nivṛtti is renunciation.” and links to the Purusha article. The entry joins the first card’s Devanagari and link to the second card’s description. Confirm them, and the Devanagari: the first card writes “प्रवृत्ति और निवृत्ति”, the second “प्रवृत्तिः निवृत्तिः च”. Nothing was looked up.',
      },
      {
        for: 'project-owner',
        note: 'Glossary descriptions, taken from the cards on the current /concepts/ page, may be adapted from DharmaWiki, the site each card links to. Decide whether they may be used, and how DharmaWiki is credited. Nothing was looked up.',
      },
    ],
  },
})
