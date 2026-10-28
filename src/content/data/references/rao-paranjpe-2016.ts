import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'rao-paranjpe-2016',
  type: 'book',
  authors: 'Rao, K. R., & Paranjpe, A. C.',
  year: '2016',
  title: 'Psychology in the Indian Tradition',
  publisher: 'Springer India',
  url: 'https://books.google.com/books?id=dXvLDQAAQBAJ',
  asCited: [
    'K Ramakrishna Rao & Paranjpe, A. C. (2016). Psychology in the Indian Tradition. New Delhi: Springer India.',
    'Rao, K. R., & Paranjpe, A. C. (2016). Psychology in the Indian Tradition.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/karta-2/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/text-books-2-2/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Google Books” link label.'],
    flags: [],
  },
})
