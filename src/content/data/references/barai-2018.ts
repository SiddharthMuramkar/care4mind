import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'barai-2018',
  type: 'journal-article',
  authors: 'Barai, A. K.',
  year: '2018',
  title: 'The Gandhian Philosophy of Truth and Non-Violence: A Pathway to Global Peace',
  container: 'Journal of Emerging Technologies and Innovative Research (JETIR)',
  volume: '5',
  issue: '1',
  pages: '364–365',
  url: 'https://www.jetir.org/papers/JETIR1801370.pdf',
  asCited: [
    'Barai, A. K. (2018). The Gandhian Philosophy of Truth and Non-Violence: A Pathway to Global Peace. In Journal of Emerging Technologies and Innovative Research (JETIR), Journal of Emerging Technologies and Innovative Research (JETIR) (Vol. 5, Issue 1, pp. 364–365) [Journal-article].',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesahimsanon-violenceprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Volume, issue and pages split out of “(Vol. 5, Issue 1, pp. 364–365)”; the journal, named twice, is kept once.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
