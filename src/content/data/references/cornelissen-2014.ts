import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'cornelissen-2014',
  type: 'book',
  authors: 'Cornelissen, R. M. M., Misra, G., Varma, S.',
  year: '2014',
  title: 'Foundations and Applications of Indian Psychology',
  url: 'https://books.google.com/books?id=VjInngEACAAJ',
  asCited: [
    'Cornelissen, R. M. M., Misra, G., Varma, S. (2014). Foundations and Applications of Indian Psychology.',
  ],
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
        ticket: 17,
      },
    ],
  },
})
