import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'praxis-2022',
  type: 'other',
  authors: 'Praxis International Journal of Social Science and Literature',
  year: '2022b',
  title: 'Praxis International Journal of Social Science and Literature',
  doi: '10.51879/pijssl',
  asCited: [
    'Praxis International Journal of Social Science and Literature. (2022b). Praxis International Journal of Social Science and Literature.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/panchkleshavikaarprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Its link, “https://doi.org/10.51879/pijssl”, is kept as the DOI.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page cites the journal as a whole, under its own name, and links the journal’s DOI rather than an article’s. Kept as given; confirm which article was meant. Nothing was looked up.',
        ticket: 17,
      },
    ],
  },
})
