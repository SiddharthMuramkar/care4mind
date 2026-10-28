import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'thapliyal-2023',
  type: 'journal-article',
  authors: 'Thapliyal, V., Tyagi, P., Jaiswal, G., & Thakur, G. S.',
  year: '2023',
  title: 'Role of Yama-Niyama in socio-personal development of an individual in the postCOvid era',
  container: 'Journal of Mountain Research',
  volume: '18',
  issue: '2',
  doi: '10.51220/jmr.v18i2.5',
  asCited: [
    'Thapliyal, V., Tyagi, P., Jaiswal, G., & Thakur, G. S. (2023). Role of Yama-Niyama in socio-personal development of an individual in the postCOvid era. Journal of Mountain Research, 18(2).',
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
      'Its link, “https://doi.org/10.51220/jmr.v18i2.5”, is kept as the DOI.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The title’s “postCOvid” is kept as the four values pages write it; nothing was looked up.',
        ticket: 17,
      },
    ],
  },
})
