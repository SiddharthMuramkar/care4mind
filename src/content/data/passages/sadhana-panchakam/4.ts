import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'sadhana-panchakam/4',
  work: 'sadhana-panchakam',
  locator: '4',
  order: [4],
  devanagari: [
    'क्षुद्व्याधिश्च चिकित्स्यतां प्रतिदिनं भिक्षौषधं भुज्यतां',
    'स्वाद्वन्नं न तु याच्यतां विधिवशात् प्राप्तेन सन्तुष्यताम् ।',
    'शीतोष्णादि विषह्यतां न तु वृथा वाक्यं समुच्चार्यता-',
    'मौदासीन्यमभीप्स्यतां जनकृपानैष्ठुर्यमुत्सृज्यताम्',
  ],
  transliteration: {
    lines: [
      'kṣudvyādhiśca cikitsyatāṃ pratidinaṃ bhikṣauṣadhaṃ bhujyatāṃ',
      'svādvannaṃ na tu yācyatāṃ vidhivaśāt prāptena santuṣyatām .',
      'śītoṣṇādi viṣahyatāṃ na tu vṛthā vākyaṃ samuccāryatā-',
      'maudāsīnyamabhīpsyatāṃ janakṛpānaiṣṭhuryamutsṛjyatām',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'spiritualpractitionerprofiling',
      text: 'In hunger diseases get treated. Daily take the medicine of Bhiksha-food. Beg no delicious food. Live contentedly upon whatever comes to your lot as ordained by Him. Endure all the pairs of opposites: heat and cold, and the like. Avoid wasteful talks. Be indifferent. Save yourself from the meshes of other peoples’ kindness.',
    },
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/spiritualpractitionerprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'The verse number after the last line is left out, since the locator holds it: “ ॥ ४ ॥” → “” and “ .. 4 ..” → “”.',
    ],
    flags: [],
  },
})
