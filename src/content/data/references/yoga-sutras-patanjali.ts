import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'yoga-sutras-patanjali',
  type: 'book',
  year: 'n.d.',
  title: 'Yoga Sutras of Patanjali',
  container: 'Google Books',
  url: 'https://books.google.co.in/books/about/Yoga_Sutras_of_Patanjali.html?id=3wCQMQEACAAJ&redir_esc=y',
  asCited: ['Yoga Sutras of Patanjali. (n.d.). Google Books.'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/upavikshepaprofiling/',
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
