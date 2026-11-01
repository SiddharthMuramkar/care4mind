import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/2.36',
  work: 'yoga-sutra',
  locator: '2.36',
  order: [2, 36],
  devanagari: ['सत्यप्रतिष्ठायां क्रियाफलाश्रयत्वम्'],
  transliteration: {
    lines: ['satyapratiṣṭhāyāṃ kriyāphalāśrayatvam'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'knowyourvaluessatyatruthfulnessprofiling',
      text: 'By the establishment of truthfulness the Yogi gets the power of attaining for himself and others the fruits of work without the works.',
    },
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Work assigned: the Satya values page heads this verse “Shloka for Know Your Values – Satya from Chapter 2, Sutra 36” and names no work there; it is stored as Yoga Sūtra 2.36, which its text and number are.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २.३६॥” → “” and “ .. 2.36..” → “”.',
      'The verse number before the translation is left out: “36. By” → “By”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'A Know Your Values page heads this verse with its chapter and sutra only, naming no work; it is stored under the Yoga Sūtra, which its text is. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
