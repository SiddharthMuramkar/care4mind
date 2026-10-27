import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'coward-1983',
  type: 'journal-article',
  authors: 'Coward, H. G.',
  year: '1983',
  title: 'Psychology and Karma',
  container: 'Philosophy East and West',
  volume: '33',
  issue: '1',
  pages: '49',
  doi: '10.2307/1398665',
  asCited: ['Coward, H. G. (1983). Psychology and Karma. Philosophy East and West, 33(1), 49.'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/karta-2/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Its link, “https://doi.org/10.2307/1398665”, is kept as the DOI.',
      'Interface text dropped: the “Read more” link label.',
    ],
    flags: [],
  },
})
