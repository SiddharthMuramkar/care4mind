import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'galotti-2008',
  type: 'book',
  authors: 'Galotti, K.M.',
  year: '2008',
  title: 'Cognitive Psychology: Perception, Attention, and Memory',
  url: 'https://books.google.com/books?id=VO3JAAAAMAAJ',
  asCited: ['Galotti, K.M. (2008). Cognitive Psychology: Perception, Attention, and Memory.'],
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
