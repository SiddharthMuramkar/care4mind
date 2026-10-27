import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/1.30',
  work: 'yoga-sutra',
  locator: '1.30',
  order: [1, 30],
  devanagari: [
    'व्याधिस्त्यानसंशयप्रमादालस्याविरति-',
    'भ्रान्तिदर्शनालब्धभूमिकत्वानवस्थितत्वानि',
    'चित्तविक्षेपास्तेऽन्तरायाः',
  ],
  transliteration: {
    lines: [
      'vyādhistyānasaṃśayapramādālasyāvirati-',
      'bhrāntidarśanālabdhabhūmikatvānavasthitatvāni',
      'cittavikṣepāste’ntarāyāḥ',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'vikshepa',
      text: 'Disease, mental laziness, doubt, lack of enthusiasm, lethargy, clinging to sense-enjoyments, false perception, non-attaining concentration, and falling away from the state when obtained, are the obstructing distractions.',
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: [
      'Relabelled: the page heads this verse “Shloka from Bhagavad Gita (Chapter 1, Sutra 30)”. Its text and number are Yoga Sūtra 1.30, as the page’s own body says.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १.३०॥” → “” and “ .. 1.30..” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page heads this verse “Bhagavad Gita (Chapter 1, Sutra 30)”; it is stored as Yoga Sūtra 1.30, which its text and number are. Confirm the attribution.',
        ticket: 16,
      },
    ],
  },
})
