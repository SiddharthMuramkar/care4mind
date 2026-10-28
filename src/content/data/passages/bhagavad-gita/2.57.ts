import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/2.57',
  work: 'bhagavad-gita',
  locator: '2.57',
  order: [2, 57],
  devanagari: [
    'यः सर्वत्रानभिस्नेहस्तत्तत्प्राप्य शुभाशुभम् ।',
    'नाभिनन्दति न द्वेष्टि तस्य प्रज्ञा प्रतिष्ठिता',
  ],
  transliteration: {
    lines: [
      'yaḥ sarvatrānabhisnehastattatprāpya śubhāśubham',
      'nābhinandati na dveṣṭi tasya prajñā pratiṣṭhitā',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'sthitaprajna',
      text: 'He who is everywhere without attachment, on meeting with anything good or bad, who neither rejoices nor hates, his Wisdom is fixed.',
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
      'The Brahmacharya values page heads this verse “Shloka for Know Your Values – Brahmacharya: Chapter 2, Verse 57”, naming no work; the Sthitaprajna page heads it, with its neighbours, “Shlokas from Bhagavad Gita (Chapter 2, Verse 54-58, 68)”.',
      'The Sthitaprajna and Brahmacharya values pages print this verse and its translation identically, so it is stored once; the translation’s id names the first of them, the Sthitaprajna page.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २-५७॥” → “” and “ 2-57” → “”.',
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
