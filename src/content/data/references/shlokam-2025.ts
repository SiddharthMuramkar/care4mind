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
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: ['Interface text dropped: the “Read more.” link label.'],
    flags: [],
  },
})
