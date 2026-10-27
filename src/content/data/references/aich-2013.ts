import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'aich-2013',
  type: 'journal-article',
  authors: 'Aich, T.',
  year: '2013',
  title: 'Buddha philosophy and western psychology',
  container: 'Indian Journal of Psychiatry',
  volume: '55',
  issue: '6',
  pages: '165',
  doi: '10.4103/0019-5545.105517',
  asCited: [
    'Aich, T. (2013). Buddha philosophy and western psychology. Indian Journal of Psychiatry, 55(6), 165.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/upavikshepaprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Its link, “https://doi.org/10.4103/0019-5545.105517”, is kept as the DOI.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
