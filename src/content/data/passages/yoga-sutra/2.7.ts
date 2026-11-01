import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/2.7',
  work: 'yoga-sutra',
  locator: '2.7',
  order: [2, 7],
  devanagari: ['सुखानुशयी रागः'],
  transliteration: {
    lines: ['sukhānuśayī rāgaḥ'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'panchkleshavikaarprofiling',
      text: 'Attachment is that which dwells on pleasure.',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/panchkleshavikaarprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Work assigned: the Panch Klesha – Vikaar Profiling page heads this verse “Pancha Klesha: Chapter 2, Sutra 7” and names no work there; it is stored as Yoga Sūtra 2.7, which its text and number are.',
      'The page prints the transliteration as a sub-heading; it is stored as the verse’s transliteration.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २.७॥” → “” and “ .. 2.7..” → “”.',
      'The verse number before the translation is left out: “7. Attachment” → “Attachment”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Panch Klesha page heads this verse with its chapter and sutra only, naming no work; it is stored under the Yoga Sūtra, which its text is. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
