import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/2.35',
  work: 'yoga-sutra',
  locator: '2.35',
  order: [2, 35],
  devanagari: ['अहिंसाप्रतिष्ठायां तत्सन्निधौ वैरत्यागः'],
  transliteration: {
    lines: ['ahiṃsāpratiṣṭhāyāṃ tatsannidhau vairatyāgaḥ'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'knowyourvaluesahimsanon-violenceprofiling',
      text: 'Non-killing being established, in his presence all enmities cease (in others).',
    },
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesahimsanon-violenceprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Work assigned: the Ahimsa values page heads this verse “Shloka for Know Your Values – Ahimsa from Chapter 2, Sutra 35” and names no work there; it is stored as Yoga Sūtra 2.35, which its text and number are.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २.३५॥” → “” and “ .. 2.35..” → “”.',
      'The verse number before the translation is left out: “35. Non-killing” → “Non-killing”.',
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
