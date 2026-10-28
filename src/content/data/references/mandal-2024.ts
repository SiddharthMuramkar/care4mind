import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'mandal-2024',
  type: 'journal-article',
  authors: 'Mandal, M.',
  year: '2024',
  title: 'Analytical Study Of Brahmavihara In Buddhism And Vedanta Philosophy',
  container: 'International Journal of Creative Research Thoughts',
  volume: '12',
  issue: '12',
  pages: '2320–2882',
  url: 'https://ijcrt.org/papers/IJCRT2412813.pdf',
  asCited: [
    'Mandal, M. (2024). Analytical Study Of Brahmavihara In Buddhism And Vedanta Philosophy. International Journal of Creative Research Thoughts, 12(12), 2320–2882.',
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
