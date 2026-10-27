import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'chatterjee-2018',
  type: 'journal-article',
  authors: 'Chatterjee, R.',
  year: '2018',
  title: 'The Social Significance of BrahmaVihara and its Relation to Nature',
  container: 'IJCRT',
  volume: '6',
  issue: '1',
  pages: '2320–2882',
  url: 'https://www.ijcrt.org/papers/IJCRT1802140.pdf',
  asCited: [
    'Chatterjee, R. (2018). The Social Significance of BrahmaVihara and its Relation to Nature. IJCRT, 6(1), 2320–2882.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/brahmavihara/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Read more.” link label.'],
    flags: [
      {
        for: 'research-editor',
        note: 'The page gives its pages as “2320–2882”, which reads like the journal’s ISSN rather than a page range. Kept as given; nothing was looked up.',
        ticket: 17,
      },
    ],
  },
})
