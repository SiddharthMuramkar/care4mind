import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/2.58',
  work: 'bhagavad-gita',
  locator: '2.58',
  order: [2, 58],
  devanagari: [
    'यदा संहरते चायं कूर्मोऽङ्गानीव सर्वशः ।',
    'इन्द्रियाणीन्द्रियार्थेभ्यस्तस्य प्रज्ञा प्रतिष्ठिता',
  ],
  transliteration: {
    lines: [
      'yadā saṃharate cāyaṃ kūrmo’ṅgānīva sarvaśaḥ',
      'indriyāṇīndriyārthebhyastasya prajñā pratiṣṭhitā',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'sthitaprajna',
      text: 'When, like the tortoise which withdraws its limbs from all sides, he withdraws his senses from the sense-objects then his Wisdom becomes steady.',
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
      'The Brahmacharya values page heads this verse “Shloka for Know Your Values – Brahmacharya: Chapter 2, Verse 58”, naming no work; the Sthitaprajna page heads it, with its neighbours, “Shlokas from Bhagavad Gita (Chapter 2, Verse 54-58, 68)”.',
      'The Sthitaprajna and Brahmacharya values pages print this verse and its translation identically, so it is stored once; the translation’s id names the first of them, the Sthitaprajna page.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २-५८॥” → “” and “ 2-58” → “”.',
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
