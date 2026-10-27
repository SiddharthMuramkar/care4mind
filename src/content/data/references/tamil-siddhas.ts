import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'tamil-siddhas',
  type: 'book',
  year: 'n.d.',
  title: 'The philosophy of the Tamil Siddhas',
  container: 'Google Books',
  url: 'https://books.google.co.in/books?id=dqfXAAAAMAAJ&printsec=front_cover&redir_esc=y',
  asCited: ['The philosophy of the Tamil Siddhas. (n.d.). Google Books.'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/spiritualpractitionerprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Read more.” link label.'],
    flags: [
      {
        for: 'research-editor',
        note: 'No author, year or publisher is given on the current site; not looked up.',
        ticket: 17,
      },
    ],
  },
})
