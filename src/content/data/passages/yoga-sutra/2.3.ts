import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/2.3',
  work: 'yoga-sutra',
  locator: '2.3',
  order: [2, 3],
  devanagari: ['अविद्यास्मितारागद्वेषाभिनिवेशाः क्लेशाः'],
  transliteration: {
    lines: ['avidyāsmitārāgadveṣābhiniveśāḥ kleśāḥ'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'panchkleshavikaarprofiling',
      text: 'The pain-bearing obstructions are — ignorance, egoism, attachment, aversion, and clinging to life.',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/panchkleshavikaarprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Work assigned: the Panch Klesha – Vikaar Profiling page heads this verse “Panch Klesha: Chapter 2, Sutra 3” and names no work there; it is stored as Yoga Sūtra 2.3, which its text and number are, and which the page’s body names: “In the Yoga Sutra of Patanjalii 2.3”.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २.३॥” → “” and “ .. 2.3..” → “”.',
      'The verse number before the translation is left out: “3. The” → “The”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Panch Klesha page heads this verse with its chapter and sutra only, naming no work; it is stored under the Yoga Sūtra, which its text is. Confirm the attribution.',
        ticket: 16,
      },
    ],
  },
})
