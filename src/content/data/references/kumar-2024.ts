import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'kumar-2024',
  type: 'journal-article',
  authors: 'Kumar, M., Alha, S., & Baberwal, A.',
  year: '2024',
  title: 'A review article on the importance of brahamcharya in healthy life of current era',
  container: 'International Journal of Creative Research Thoughts (IJCRT)',
  volume: '12',
  issue: '10',
  pages: 'e674',
  url: 'https://ijcrt.org/papers/IJCRT2410552.pdf',
  asCited: [
    'Kumar, M., Alha, S., & Baberwal, A. (2024). A review article on the importance of brahamcharya in healthy life of current era. In International Journal of Creative Research Thoughts (IJCRT), International Journal of Creative Research Thoughts (IJCRT) (Vol. 12, Issue 10, p. e674) [Journal-article].',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Volume, issue and page split out of “(Vol. 12, Issue 10, p. e674)”; the journal, named twice, is kept once.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
