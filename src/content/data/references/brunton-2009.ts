import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'brunton-2009',
  type: 'book',
  authors: 'Brunton, P.',
  year: '2009',
  title: 'The Maharshi and his message',
  publisher: 'Sri Ramanasramam',
  noStableLink: 'none given on the current site; not looked up',
  asCited: ['Brunton, P. (2009). The Maharshi and his message. Tiruvannamalai: Sri Ramanasramam.'],
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
