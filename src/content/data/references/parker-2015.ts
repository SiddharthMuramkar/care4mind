import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'parker-2015',
  type: 'book',
  authors: 'Parker, S.',
  year: '2015',
  title: 'Clearing the Path',
  url: 'https://books.google.com/books?id=9uWODQAAQBAJ',
  asCited: ['Parker, S. (2015). Clearing the Path.'],
  provenance: {
    sources: [
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
