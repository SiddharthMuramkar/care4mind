import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'rao-marwaha-2005',
  type: 'book',
  authors: 'Rao, K. R. & Marwaha, S. B.',
  year: '2005',
  title: 'Towards a Spiritual Psychology: Essays in Indian Psychology',
  noStableLink:
    'none given on the current site (its “More Info” links point nowhere); not looked up',
  asCited: [
    'Rao, K. R. & Marwaha, S. B. (2005). Towards a Spiritual Psychology: Essays in Indian Psychology.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/text-books/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/indian-philosophy/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Its “More Info” link, which points nowhere (“#”), is dropped.',
      'Interface text dropped: the “More Info” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'Its “More Info” link on Text Books and Indian Philosophy points nowhere (“#”) and is dropped. No other link is given; nothing was looked up. Add a stable link if the work has one (FR-03).',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'No publisher is given on the current site; not looked up.',
        ticket: 17,
      },
    ],
  },
})
