import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'sternberg-2009',
  type: 'book',
  authors: 'Sternberg, R.J.',
  year: '2009',
  title: 'Applied Cognitive Psychology',
  url: 'https://books.google.com/books?id=U9wJCAAAQBAJ',
  asCited: ['Sternberg, R.J. (2009). Applied Cognitive Psychology.'],
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
        ticket: 17,
      },
    ],
  },
})
