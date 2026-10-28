import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'sadhana-panchakam/1',
  work: 'sadhana-panchakam',
  locator: '1',
  order: [1],
  devanagari: [
    'वेदो नित्यमधीयतां तदुदितं कर्म स्वनुष्ठीयतां',
    'तेनेशस्य विधीयतामपचितिः काम्ये मतिस्त्यज्यताम् ।',
    'पापौघः परिधूयतां भवसुखे दोषोऽनुसन्धीयता-',
    'मात्मेच्छा व्यवसीयतां निजगृहात्तूर्णं विनिर्गम्यताम्',
  ],
  transliteration: {
    lines: [
      'vedo nityamadhīyatāṃ taduditaṃ karma svanuṣṭhīyatāṃ',
      'teneśasya vidhīyatāmapacitiḥ kāmye matistyajyatām .',
      'pāpaughaḥ paridhūyatāṃ bhavasukhe doṣo’nusandhīyatā-',
      'mātmecchā vyavasīyatāṃ nijagṛhāttūrṇaṃ vinirgamyatām',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'spiritualpractitionerprofiling',
      text: 'Study the Vedas daily. Perform diligently the duties (karmas) ordained by them. Dedicate all those actions (karmas) as worship unto the Lord. Renounce all desires in the mind. Wash away the hoards of sins in the bosom. Recognise that the pleasures of sense-objects (samsar) are riddled with pain. Seek the Self with consistent endeavour. Escape from the bondage of ‘home’.',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/spiritualpractitionerprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १॥” → “” and “ .. 1..” → “”.',
    ],
    flags: [],
  },
})
