import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'kellogg-2007',
  type: 'book',
  authors: 'Kellogg, R.T.',
  year: '2007',
  title: 'Cognitive Psychology',
  url: 'https://study.sagepub.com/kellogg3e',
  asCited: ['Kellogg, R.T. (2007). Cognitive Psychology.'],
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
    edits: ['Interface text dropped: the “Learn More” link label.'],
    flags: [
      {
        for: 'research-editor',
        note: 'No publisher is given on the current site; not looked up.',
        ticket: 17,
      },
    ],
  },
})
