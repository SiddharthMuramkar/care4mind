import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/1.31',
  work: 'yoga-sutra',
  locator: '1.31',
  order: [1, 31],
  devanagari: ['दुःखदौर्मनस्याङ्गमेजयत्वश्वासप्रश्वासा विक्षेपसहभुवः'],
  transliteration: {
    lines: ['duḥkhadaurmanasyāṅgamejayatvaśvāsapraśvāsā vikṣepasahabhuvaḥ'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'upavikshepaprofiling',
      text: 'Grief, mental distress, tremor of the body, irregular breathing, accompany non-retention of concentration.',
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/upavikshepaprofiling/', retrieved: '2026-10-27' }],
    edits: [
      'Work assigned: the Upa-Vikshepa Profiling page heads this verse “Shloka from Chapter 1, Sutra 31” and names no work there; it is stored as Yoga Sūtra 1.31, which its text and number are, and which the page’s body names: “The Patanjali Yoga Sutra 1.31 outlines these byproducts”.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १.३१॥” → “” and “ .. 1.31..” → “”.',
      'The verse number before the translation is left out: “31. Grief,” → “Grief,”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Upa-Vikshepa Profiling page heads this verse “Shloka from Chapter 1, Sutra 31” and names no work there; it is stored as Yoga Sūtra 1.31, which its text is and which the page’s body names. Confirm the attribution.',
        ticket: 16,
      },
    ],
  },
})
