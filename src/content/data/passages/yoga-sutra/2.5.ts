import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/2.5',
  work: 'yoga-sutra',
  locator: '2.5',
  order: [2, 5],
  devanagari: ['अनित्याशुचिदुःखानात्मसु नित्यशुचिसुखात्मख्यातिरविद्या'],
  transliteration: {
    lines: ['anityāśuciduḥkhānātmasu nityaśucisukhātmakhyātiravidyā'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'panchkleshavikaarprofiling',
      text: 'Ignorance is taking the non-eternal, the impure, the painful, and the non-Self for the eternal, the pure, the happy, and the Atman or Self (respectively).',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/panchkleshavikaarprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Work assigned: the Panch Klesha – Vikaar Profiling page heads this verse “Pancha Klesha: Chapter 2, Sutra 5” and names no work there; it is stored as Yoga Sūtra 2.5, which its text and number are.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २.५॥” → “” and “ .. 2.5..” → “”.',
      'The verse number before the translation is left out: “5. Ignorance” → “Ignorance”.',
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
