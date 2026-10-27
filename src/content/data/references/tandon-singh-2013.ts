import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'tandon-singh-2013',
  type: 'journal-article',
  authors: 'Tandon, A., & Singh, V.',
  year: '2013',
  title: 'Impact of Mahatma Gandhi’s concepts on mental health: Reflections',
  container: 'Indian Journal of Psychiatry',
  volume: '55',
  issue: '6',
  pages: '231',
  doi: '10.4103/0019-5545.105540',
  asCited: [
    'Tandon, A., & Singh, V. (2013). Impact of Mahatma Gandhi′s concepts on mental health: Reflections. Indian Journal of Psychiatry, 55(6), 231.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Typo fixed: “Gandhi′s” → “Gandhi’s”.',
      'Its link, “https://doi.org/10.4103/0019-5545.105540”, is kept as the DOI.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
