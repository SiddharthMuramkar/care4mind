import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/2.30',
  work: 'yoga-sutra',
  locator: '2.30',
  order: [2, 30],
  devanagari: ['अहिंसासत्यास्तेयब्रह्मचर्यापरिग्रहा यमाः'],
  transliteration: {
    lines: ['ahiṃsāsatyāsteyabrahmacaryāparigrahā yamāḥ'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'knowyourvaluesahimsanon-violenceprofiling',
      text: 'Non-killing, truthfulness, non-stealing, continence, and non-receiving are called Yamas.',
    },
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesahimsanon-violenceprofiling/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/knowyourvaluesasteyanonstealingprofiling/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Work assigned: the four Know Your Values pages head this verse “Shloka for Know Your Values – Yama from Chapter 2, Sutra 30” and name no work there; it is stored as Yoga Sūtra 2.30, which its text and number are.',
      'The four Know Your Values pages print this verse and its translation identically, so it is stored once; the translation’s id names the first of them, the Ahimsa page.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २.३०॥” → “” and “ .. 2.30..” → “”.',
      'The verse number before the translation is left out: “30. Non-killing,” → “Non-killing,”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'A Know Your Values page heads this verse with its chapter and sutra only, naming no work; it is stored under the Yoga Sūtra, which its text is. Confirm the attribution.',
        ticket: 16,
      },
    ],
  },
})
