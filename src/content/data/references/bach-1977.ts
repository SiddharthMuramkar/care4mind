import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'bach-1977',
  type: 'book',
  authors: 'Bach, R.',
  year: '1977',
  title: 'Illusions',
  publisher: 'Arrow Books',
  noStableLink: 'none given on the current site; not looked up',
  asCited: ['Bach, R. (1977). Illusions. London: Arrow Books.'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/inspirational-books/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [],
    flags: [
      {
        for: 'research-editor',
        note: 'No DOI or link is given on the current site; not looked up. Add a stable link if the work has one (FR-03).',
        ticket: 17,
      },
    ],
  },
})
