import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'cornelissen-2011',
  type: 'book',
  authors: 'Cornelissen, M.',
  year: '2011',
  title: 'Foundations of Indian Psychology',
  url: 'https://books.google.com/books?id=9Oj9DwAAQBAJ',
  asCited: ['Cornelissen, M. (2011). Foundations of Indian Psychology.'],
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
