import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'lopez-2021',
  type: 'book',
  authors: 'Lopez, S. J., et al.',
  year: '2021',
  title: 'Positive Psychology',
  url: 'https://books.google.com/books?id=ayIWDAAAQBAJ',
  asCited: ['Lopez, S. J., et al. (2021). Positive Psychology.'],
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
        decidedBy: 'references',
      },
    ],
  },
})
