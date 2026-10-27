import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'hunt-ellis-2006',
  type: 'book',
  authors: 'Hunt, R. R., & Ellis, H.C.',
  year: '2006',
  title: 'Fundamentals of Cognitive Psychology',
  url: 'https://archive.org/details/fundamentalsofc000hunt',
  asCited: ['Hunt, R. R., & Ellis, H.C. (2006). Fundamentals of Cognitive Psychology.'],
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
    edits: ['Interface text dropped: the “Read Online” link label.'],
    flags: [
      {
        for: 'research-editor',
        note: 'No publisher is given on the current site; not looked up.',
        ticket: 17,
      },
    ],
  },
})
