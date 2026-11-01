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
    sources: [
      { url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/knowyourmind/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Relabelled: the Vikshepa page heads this verse “Shloka from Bhagavad Gita (Chapter 1, Sutra 30)”. Its text and number are Yoga Sūtra 1.30, as the page’s own body says.',
      'The verse number after the last line of the Vikshepa page’s form, the one stored, is left out, since the locator holds it: “ ॥ १.३०॥” → “” and “ .. 1.30..” → “”.',
      'Know Your Mind quotes this verse in another form, listed here and not stored: the Devanagari in one line, broken into words, “व्याधि स्त्यान संशय प्रमादालस्याविरति भ्रान्तिदर्शनालब्ध भूमिकत्वानवस्थितत्वानि चित्तविक्षेपास्तेऽन्तरायाः”, and its transliteration in one line, broken into words, with the anusvara written with a dot above (U+1E41) where this record has ṃ, “vyādhi styāna saṃśaya pramāda-ālasya-avirati bhrāntidarśana-alabdha-bhūmikatva-anavasthitatvāni citta-vikṣepāḥ te antarāyāḥ”. Its English line is labelled “Meaning”, so that page adds no translation.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Vikshepa page heads this verse “Bhagavad Gita (Chapter 1, Sutra 30)”; it is stored as Yoga Sūtra 1.30, which its text and number are. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
