import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/2.9',
  work: 'yoga-sutra',
  locator: '2.9',
  order: [2, 9],
  devanagari: ['स्वरसवाही विदुषोऽपि तथारूढोऽभिनिवेशः'],
  transliteration: {
    lines: ['svarasavāhī viduṣo’pi tathārūḍho’bhiniveśaḥ'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'panchkleshavikaarprofiling',
      text: 'Flowing through its own nature, and established even in the learned, is the clinging to life.',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/panchkleshavikaarprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Work assigned: the Panch Klesha – Vikaar Profiling page heads this verse “Pancha Klesha: Chapter 2, Sutra 9” and names no work there; it is stored as Yoga Sūtra 2.9, which its text and number are.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २.९॥” → “” and “ .. 2.9..” → “”.',
      'The verse number before the translation is left out: “9. Flowing” → “Flowing”.',
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
