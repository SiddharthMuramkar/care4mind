import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'gangasagre',
  type: 'journal-article',
  authors: 'Gangasagre, J. N. G. a. D. N. S.',
  year: 'n.d.',
  title: 'WJPMR | Abstract',
  url: 'https://www.wjpmr.com/home/article_abstract/1053',
  asCited: ['Gangasagre, J. N. G. a. D. N. S. (n.d.). WJPMR | Abstract.'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/fivestepsofperfectionprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Read more.” link label.'],
    flags: [
      {
        for: 'research-editor',
        note: 'The page gives the title as “WJPMR | Abstract”, the name of the journal’s abstract page rather than the paper’s title, and the authors as “Gangasagre, J. N. G. a. D. N. S.”, which may run two authors together. Kept as given; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'No year or journal (container) is given on the current site; not looked up.',
        ticket: 17,
      },
    ],
  },
})
