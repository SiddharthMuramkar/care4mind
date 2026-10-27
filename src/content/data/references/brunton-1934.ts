import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'brunton-1934',
  type: 'book',
  authors: 'Brunton, P.',
  year: '1934',
  title: 'A search into secret India',
  publisher: 'Random House',
  noStableLink: 'none given on the current site; not looked up',
  asCited: ['Brunton, P. (1934). A search into secret India. London: Random House.'],
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
