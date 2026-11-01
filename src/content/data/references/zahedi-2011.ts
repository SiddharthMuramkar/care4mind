import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'zahedi-2011',
  type: 'journal-article',
  authors: 'Zahedi, F.',
  year: '2011, December 27',
  title: 'The challenge of truth telling across cultures: a case study',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3713926/',
  asCited: [
    'Zahedi, F. (2011, December 27). The challenge of truth telling across cultures: a case study.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Read more.” link label.'],
    flags: [
      {
        for: 'research-editor',
        note: 'No journal (container) is given on the current site; not looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
