import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'shlokam-2020-sadhana-panchakam',
  type: 'web-page',
  authors: 'Shlokam.org',
  year: '2020, November 22',
  title: 'Sādhana Panchakam Verses in Sanskrit, English with Commentary',
  container: 'Shlokam',
  url: 'https://shlokam.org/SadhanaPanchakam/',
  asCited: [
    'Shlokam.org. (2020, November 22). Sādhana Panchakam Verses in Sanskrit, English with Commentary. Shlokam.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/spiritualpractitionerprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Read more.” link label.'],
    flags: [],
  },
})
