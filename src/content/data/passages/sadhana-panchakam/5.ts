import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'sadhana-panchakam/5',
  work: 'sadhana-panchakam',
  locator: '5',
  order: [5],
  devanagari: [
    'एकान्ते सुखमास्यतां परतरे चेतः समाधीयतां',
    'पूर्णात्मा सुसमीक्ष्यतां जगदिदं तद्बाधितं दृश्यताम् ।',
    'प्राक्कर्म प्रविलाप्यतां चितिबलान्नाप्युत्तरैः श्लिष्यतां',
    'प्रारब्धं त्विह भुज्यतामथ परब्रह्मात्मना स्थीयताम्',
  ],
  transliteration: {
    lines: [
      'ekānte sukhamāsyatāṃ paratare cetaḥ samādhīyatāṃ',
      'pūrṇātmā susamīkṣyatāṃ jagadidaṃ tadbādhitaṃ dṛśyatām .',
      'prākkarma pravilāpyatāṃ citibalānnāpyuttaraiḥ śliṣyatāṃ',
      'prārabdhaṃ tviha bhujyatāmatha parabrahmātmanā sthīyatām',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'spiritualpractitionerprofiling',
      text: 'In solitude live joyously. Quieten your mind in the Supreme Lord. Realise and see the All-pervading Self everywhere. Recognise that the finite Universe is a projection of the Self. Conquer the effects of the deeds done in earlier lives by the present right action. Through wisdom become detached from future actions (Agami). Experience and exhaust “Prarabdha” the fruits of past actions. Thereafter, live absorbed in the bhav – “I am Brahman”!',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/spiritualpractitionerprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'The verse number after the last line is left out, since the locator holds it: “ ॥ ५॥” → “” and “ .. 5..” → “”.',
    ],
    flags: [],
  },
})
