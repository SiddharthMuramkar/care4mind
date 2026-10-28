import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'rao-1989',
  type: 'journal-article',
  authors: 'Rao, K. L. S.',
  year: '1989',
  title: 'Sri Aurobindo on the types of Shraddha (faith) in the “Gita”',
  container: 'Journal of South Asian Literature',
  volume: '24',
  issue: '1',
  pages: '168–178',
  url: 'http://www.jstor.org/stable/40873989',
  asCited: [
    'Rao, K. L. S. (1989). SRI AUROBINDO ON THE TYPES OF SHRADDHA (FAITH) IN THE “GITA.” Journal of South Asian Literature, 24(1), 168–178.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/fivestepsofperfectionprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Title in sentence case, without the closing full stop inside its quotes: “SRI AUROBINDO ON THE TYPES OF SHRADDHA (FAITH) IN THE “GITA.”” → “Sri Aurobindo on the types of Shraddha (faith) in the “Gita””.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
