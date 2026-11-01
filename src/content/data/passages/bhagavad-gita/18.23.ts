import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/18.23',
  work: 'bhagavad-gita',
  locator: '18.23',
  order: [18, 23],
  devanagari: ['नियतं सङ्गरहितमरागद्वेषतः कृतम् ।', 'अफलप्रेप्सुना कर्म यत्तत्सात्त्विकमुच्यते'],
  transliteration: {
    lines: [
      'niyataṃ saṅgarahitamarāgadveṣataḥ kṛtam',
      'aphalaprepsunā karma yattatsāttvikamucyate',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'karta-2',
      text: 'An action which is ordained, free from attachment, done without love or hatred, by one who is not desirous of its fruits, is declared to be Sattvic (pure).',
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/karta-2/', retrieved: '2026-10-27' }],
    edits: [
      'The page gives the English line under the verse no label; it is stored as the translation.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १८-२३॥” → “” and “ 18-23” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page prints the English line under this verse with no “Translation” or “Meaning” label; it is stored as the verse’s translation. Confirm it is a translation rather than the page’s own reading.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
