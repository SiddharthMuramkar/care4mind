import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'sadhana-panchakam/3',
  work: 'sadhana-panchakam',
  locator: '3',
  order: [3],
  devanagari: [
    'वाक्यार्थश्च विचार्यतां श्रुतिशिरःपक्षः समाश्रीयतां',
    'दुस्तर्कात्सुविरम्यतां श्रुतिमतस्तर्कोऽनुसन्धीयताम् ।',
    'ब्रह्मास्मीति विभाव्यतामहरहर्गर्वः परित्यज्यतां',
    'देहेऽहम्मतिरुज्झ्यतां बुधजनैर्वादः परित्यज्यताम्',
  ],
  transliteration: {
    lines: [
      'vākyārthaśca vicāryatāṃ śrutiśiraḥpakṣaḥ samāśrīyatāṃ',
      'dustarkātsuviramyatāṃ śrutimatastarko’nusandhīyatām .',
      'brahmāsmīti vibhāvyatāmaharahargarvaḥ parityajyatāṃ',
      'dehe’hammatirujjhyatāṃ budhajanairvādaḥ parityajyatām',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'spiritualpractitionerprofiling',
      text: 'Reflect upon the meaning of the Upanishadic commandments, and take refuge in the Truth of Brahman. Avoid perverse arguments but follow the discriminative rationale of the Sruti (Upanishads). Always be absorbed in the attitude (bhav) – “I am Brahman”. Renounce pride. Give up the delusory misconception – “I am the body”. Give up totally the tendency to argue with wise men.',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/spiritualpractitionerprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'The verse number after the last line is left out, since the locator holds it: “ ॥ ३॥” → “” and “ .. 3..” → “”.',
    ],
    flags: [],
  },
})
