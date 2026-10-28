import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'roche-2018',
  type: 'journal-article',
  authors: 'Roche, L.',
  year: '2018',
  title: 'Yoga: A self-regulation process',
  container: 'Yoga Mimamsa',
  volume: '50',
  issue: '1',
  pages: '16',
  doi: '10.4103/ym.ym_22_17',
  asCited: ['Roche, L. (2018). Yoga: A self-regulation process. Yoga Mimamsa, 50(1), 16.'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/panchkleshavikaarprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Its link, “https://doi.org/10.4103/ym.ym_22_17”, is kept as the DOI.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
