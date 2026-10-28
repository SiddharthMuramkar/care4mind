import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'singh-2020',
  type: 'journal-article',
  authors: 'Singh, S. P.',
  year: '2020',
  title: 'Indian perspective of Freud’s Psychoanalysis Theory',
  container: 'Journal of Emerging Technologies and Innovative Research',
  volume: '7',
  issue: '9',
  pages: '265–267',
  url: 'https://www.jetir.org',
  asCited: [
    'Singh, S. P. (2020). Indian perspective of Freud’s Psychoanalysis Theory. Journal of Emerging Technologies and Innovative Research, 7(9), 265–267.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/panchkleshavikaarprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Read more.” link label.'],
    flags: [
      {
        for: 'research-editor',
        note: 'Its link goes to the journal’s home page (https://www.jetir.org), not to the paper; kept as its URL. Give the paper’s own link; nothing was looked up.',
        ticket: 17,
      },
    ],
  },
})
