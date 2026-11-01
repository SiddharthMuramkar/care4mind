import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'epra-2019',
  type: 'other',
  authors: 'EPRA International Journal of Multidisciplinary Research (IJMR)',
  year: '2019b',
  title: 'EPRA International Journal of Multidisciplinary Research (IJMR)',
  doi: '10.36713/epra2013',
  asCited: [
    'EPRA International Journal of Multidisciplinary Research (IJMR). (2019b). EPRA International Journal of Multidisciplinary Research (IJMR).',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesahimsanon-violenceprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Its link, “https://doi.org/10.36713/epra2013”, is kept as the DOI.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page cites the journal as a whole, under its own name, and links the journal’s DOI rather than an article’s. Kept as given; confirm which article was meant. Nothing was looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
