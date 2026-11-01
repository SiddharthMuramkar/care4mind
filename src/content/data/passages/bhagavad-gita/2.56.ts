import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/2.56',
  work: 'bhagavad-gita',
  locator: '2.56',
  order: [2, 56],
  devanagari: ['दुःखेष्वनुद्विग्नमनाः सुखेषु विगतस्पृहः ।', 'वीतरागभयक्रोधः स्थितधीर्मुनिरुच्यते'],
  transliteration: {
    lines: [
      'duḥkheṣvanudvignamanāḥ sukheṣu vigataspṛhaḥ',
      'vītarāgabhayakrodhaḥ sthitadhīrmunirucyate',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'sthitaprajna',
      text: 'He whose mind is not shaken by adversity, and who in prosperity does not hanker after pleasures, who is free from attachment, fear and anger, is called a Sage-of-Steady-Wisdom.',
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
      'The Brahmacharya values page heads this verse “Shloka for Know Your Values – Brahmacharya: Chapter 2, Verse 56”, naming no work; the Sthitaprajna page heads it, with its neighbours, “Shlokas from Bhagavad Gita (Chapter 2, Verse 54-58, 68)”.',
      'The Sthitaprajna and Brahmacharya values pages print this verse and its translation identically, so it is stored once; the translation’s id names the first of them, the Sthitaprajna page.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २-५६॥” → “” and “ 2-56” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Brahmacharya values page heads this verse with its chapter and verse only, naming no work; the Sthitaprajna page heads the same verse as the Bhagavad Gita’s, and it is stored under the Bhagavad Gītā. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
