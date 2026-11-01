import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'reed-2010',
  type: 'book',
  authors: 'Reed, S.K.',
  year: '2010',
  title: 'Cognition: Theories and Applications',
  url: 'https://books.google.com/books?id=-aGXBgAAQBAJ',
  asCited: ['Reed, S.K. (2010). Cognition: Theories and Applications.'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/text-books/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/text-books-2-2/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Google Books” link label.'],
    flags: [
      {
        for: 'research-editor',
        note: 'No publisher is given on the current site; not looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
