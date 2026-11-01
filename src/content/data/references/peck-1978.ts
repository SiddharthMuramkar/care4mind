import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'peck-1978',
  type: 'book',
  authors: 'Peck, S. M.',
  year: '1978',
  title:
    'The road less traveled: A new psychology of love, traditional values, and spiritual growth',
  publisher: 'Simon & Schuster',
  noStableLink: 'none given on the current site; not looked up',
  asCited: [
    'Peck, S. M. (1978). The road less traveled: A new psychology of love, traditional values, and spiritual growth. New York: Simon & Schuster.',
  ],
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
        decidedBy: 'references',
      },
    ],
  },
})
