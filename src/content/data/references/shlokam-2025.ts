import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'shlokam-2025',
  type: 'web-page',
  authors: 'Shlokam.org',
  year: '2025, July 2',
  title: 'Hindu shlokas, Bhagavad gita, Upanishads, granthas, mantras',
  container: 'Shlokam',
  url: 'https://shlokam.org/',
  asCited: [
    'Shlokam.org. (2025, July 2). Hindu shlokas, Bhagavad gita, Upanishads, granthas, mantras. Shlokam.',
    'Hindu Shlokas, Bhagavad Gita, Upanishads, Granthas, Mantras. (2025, March 22). Shlokam.',
    'Shlokam.org',
  ],
  provenance: {
    sources: [
      { url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/sthitaprajna/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/brahmavihara/', retrieved: '2026-10-27' },
      { url: 'https://care4mind.org/triguna/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Interface text dropped: the “Read more.” link label.',
      'Brahma Vihara links the same home page as “http://shlokam.org”; the record keeps “https://shlokam.org/”, as the other pages link it.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The pages cite the shlokam.org home page three ways: dated 2025, July 2 on Vikshepa and Sthitaprajna; as “Hindu Shlokas, Bhagavad Gita, Upanishads, Granthas, Mantras” dated 2025, March 22 on Brahma Vihara; and as “Shlokam.org” among Triguna’s online resources. Stored as one Reference with each form kept as cited, and the July date. Confirm the date; nothing was looked up.',
        ticket: 17,
      },
    ],
  },
})
