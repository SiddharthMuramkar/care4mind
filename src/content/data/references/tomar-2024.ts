import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'tomar-2024',
  type: 'book',
  authors: 'Tomar, V. S.',
  year: '2024',
  title: 'Self management through self evaluation',
  publisher: 'Prabhat Prakashan',
  url: 'https://books.google.co.in/books?id=PeYdEQAAQBAJ',
  asCited: ['Tomar, V. S. (2024). Self management through self evaluation. Prabhat Prakashan.'],
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: [
      'Google Books link shortened to the book’s id: “https://books.google.co.in/books?id=PeYdEQAAQBAJ&dq=self+management+through+self+evaluation&hl=&cd=1&source=gbs_api&redir_esc=y” → “https://books.google.co.in/books?id=PeYdEQAAQBAJ”.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
