import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/1.20',
  work: 'yoga-sutra',
  locator: '1.20',
  order: [1, 20],
  devanagari: ['श्रद्धावीर्यस्मृतिसमाधिप्रज्ञापूर्वक इतरेषाम्'],
  transliteration: {
    lines: ['śraddhāvīryasmṛtisamādhiprajñāpūrvaka itareṣām'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'fivestepsofperfectionprofiling',
      text: 'To others (this Samadhi) comes through faith, energy, memory, concentration, and discrimination of the real.',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/fivestepsofperfectionprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Work assigned: the Five Steps of Perfection page heads this verse “Shlokas of Perfection from Chapter 1, Sutra 20” and names no work there; it is stored as Yoga Sūtra 1.20, which its text and number are.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १.२०॥” → “” and “ .. 1.20..” → “”.',
      'The verse number before the translation is left out: “20. To” → “To”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Five Steps of Perfection page heads this verse “Shlokas of Perfection from Chapter 1, Sutra 20” and names no work; it is stored as Yoga Sūtra 1.20, which its text is. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
