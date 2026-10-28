import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'bhavanani-2012',
  type: 'journal-article',
  authors: 'Bhavanani, Y. D. A. B.',
  year: '2012',
  title: 'Obstacles on the path of yoga',
  container: 'Yoga Life',
  volume: '43',
  pages: '3–9',
  url: 'https://www.researchgate.net/publication/237077542_OBSTACLES_ON_THE_PATH_OF_YOGA',
  asCited: ['Bhavanani, Y. D. A. B. (2012). OBSTACLES ON THE PATH OF YOGA. Yoga Life, 43, 3-9.'],
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: [
      'Title in sentence case: “OBSTACLES ON THE PATH OF YOGA” → “Obstacles on the path of yoga”.',
      'Page range with an en dash: “3-9” → “3–9”.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
