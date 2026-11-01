import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'solso-2006',
  type: 'book',
  authors: 'Solso, R.L.',
  year: '2006',
  title: 'Cognitive Psychology',
  url: 'https://books.google.com/books?id=6Z2IEAAAQBAJ',
  asCited: ['Solso, R.L. (2006). Cognitive Psychology.'],
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
