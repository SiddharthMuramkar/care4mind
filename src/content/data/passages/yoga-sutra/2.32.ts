import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'yoga-sutra/2.32',
  work: 'yoga-sutra',
  locator: '2.32',
  order: [2, 32],
  devanagari: ['शौचसंतोषतपःस्वाध्यायेश्वरप्रणिधानानि नियमाः'],
  transliteration: {
    lines: ['śaucasaṃtoṣatapaḥsvādhyāyeśvarapraṇidhānāni niyamāḥ'],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'knowyourvaluesahimsanon-violenceprofiling',
      text: 'Internal and external purification, contentment, mortification, study, and worship of God are the Niyamas.',
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
      'Work assigned: the four Know Your Values pages head this verse “Shloka for Know Your Values – Niyama from Chapter 2, Sutra 32” and name no work there; it is stored as Yoga Sūtra 2.32, which its text and number are.',
      'The four Know Your Values pages print this verse and its translation identically, so it is stored once; the translation’s id names the first of them, the Ahimsa page.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ २.३२॥” → “” and “ .. 2.32..” → “”.',
      'The verse number before the translation is left out: “32. Internal” → “Internal”.',
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
