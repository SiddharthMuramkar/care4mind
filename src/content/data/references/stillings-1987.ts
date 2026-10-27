import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'stillings-1987',
  type: 'book',
  authors: 'Stillings, N., et al.',
  year: '1987',
  title: 'Cognitive Science: An Introduction',
  url: 'https://books.google.com/books?id=UTw9AAAAIAAJ',
  asCited: ['Stillings, N., et al. (1987). Cognitive Science: An Introduction.'],
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
