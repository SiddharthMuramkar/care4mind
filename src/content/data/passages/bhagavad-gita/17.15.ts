import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'bhagavad-gita/17.15',
  work: 'bhagavad-gita',
  locator: '17.15',
  order: [17, 15],
  devanagari: [
    'अनुद्वेगकरं वाक्यं सत्यं प्रियहितं च यत् ।',
    'स्वाध्यायाभ्यसनं चैव वाङ्मयं तप उच्यते',
  ],
  transliteration: {
    lines: [
      'anudvegakaraṃ vākyaṃ satyaṃ priyahitaṃ ca yat',
      'svādhyāyābhyasanaṃ caiva vāṅmayaṃ tapa ucyate',
    ],
    scheme: 'iast',
  },
  translations: [
    {
      id: 'knowyourvaluessatyatruthfulnessprofiling',
      text: 'Speech which causes no excitement, and is truthful, pleasant and beneficial, and the practice of the study of the VEDAS, these constitute the austerity of speech.',
    },
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Work assigned: the Satya values page heads this verse “Shloka for Know Your Values – Satya from Chapter 17, Verse 15” and names no work there; it is stored as Bhagavad Gītā 17.15, which its text and number are; the page’s reference list cites “Bhagavad Gita Chapter 17 – Verse 15” on Shlokam.org.',
      'The verse number after the last line is left out, since the locator holds it: “ ॥ १७-१५॥” → “” and “ 17-15” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Satya values page heads this verse “Chapter 17, Verse 15” and names no work; it is stored as Bhagavad Gītā 17.15, which its text is and which the page’s reference list names. Confirm the attribution.',
        decidedBy: 'traditional-texts',
      },
    ],
  },
})
