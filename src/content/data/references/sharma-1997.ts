import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'sharma-1997',
  type: 'journal-article',
  authors: 'Sharma, A.',
  year: '1997',
  title: 'Sankara on the Sthitaprajna',
  container: 'Nidan: International Journal for Indian Studies',
  volume: '1997',
  issue: '9',
  pages: '49–53',
  url: 'https://journals.co.za/doi/pdf/10.10520/AJA10165320_18',
  asCited: [
    'Sharma, A. (1997). Sankara on the Sthitaprajna. Nidan: International Journal for Indian Studies, 1997(9), 49-53.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/sthitaprajna/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Page range with an en dash: “49-53” → “49–53”.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
