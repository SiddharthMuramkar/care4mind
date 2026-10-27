import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/2.55',
  work: 'bhagavad-gita',
  locator: '2.55',
  order: [2, 55],
  devanagari: [
    'श्रीभगवानुवाच ।',
    'प्रजहाति यदा कामान्सर्वान्पार्थ मनोगतान् ।',
    'आत्मन्येवात्मना तुष्टः स्थितप्रज्ञस्तदोच्यते',
  ],
  transliteration: {
    lines: [
      'śrībhagavānuvāca',
      'prajahāti yadā kāmānsarvānpārtha manogatān',
      'ātmanyevātmanā tuṣṭaḥ sthitaprajñastadocyate',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'sthitaprajna',
      text: 'The Blessed Lord said: When a man completely casts off, O Partha, all the desires of the mind, and is satisfied in the Self by the Self, then is he said to be one of steady Wisdom.',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/sthitaprajna/', retrieved: '2026-10-27' },
      {
        url: 'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'The Brahmacharya values page heads this verse “Shloka for Know Your Values – Brahmacharya: Chapter 2, Verse 55”, naming no work; the Sthitaprajna page heads it, with its neighbours, “Shlokas from Bhagavad Gita (Chapter 2, Verse 54-58, 68)”.',
      'The Sthitaprajna and Brahmacharya values pages print this verse and its translation identically, so it is stored once; the translation’s id names the first of them, the Sthitaprajna page.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २-५५॥” → “” and “ 2-55” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Brahmacharya values page heads this verse with its chapter and verse only, naming no work; the Sthitaprajna page heads the same verse as the Bhagavad Gita’s, and it is stored under the Bhagavad Gītā. Confirm the attribution.',
        ticket: 16,
      },
    ],
  },
})
