import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'rao-2008',
  type: 'book',
  authors: 'Rao, K. R., Paranjpe, A. C., Dalal, A. K.',
  year: '2008',
  title: 'Handbook of Indian Psychology',
  url: 'https://books.google.com/books?id=LSrZAAAAMAAJ',
  asCited: ['Rao, K. R., Paranjpe, A. C., Dalal, A. K. (2008). Handbook of Indian Psychology.'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/text-books/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/indian-philosophy/',
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
