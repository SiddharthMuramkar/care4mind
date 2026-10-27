import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'samant',
  type: 'journal-article',
  authors: 'Samant, N.',
  title:
    'Eastern Philosophy and Western Science: A Parallel Study of the Bhagavad Gita and Western Theories',
  url: 'https://www.the-criterion.com/V14/n1/CT02.pdf',
  asCited: [
    'Samant, N. Eastern Philosophy and Western Science: A Parallel Study of the Bhagavad Gita and Western Theories.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/sthitaprajna/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Read more.” link label.'],
    flags: [
      {
        for: 'research-editor',
        note: 'The reference line gives no year; the page’s in-text citation reads “(Samant, 2023)”. The year is left empty; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'No year or journal (container) is given on the current site; not looked up.',
        ticket: 17,
      },
    ],
  },
})
