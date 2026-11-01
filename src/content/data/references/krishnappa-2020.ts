import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'krishnappa-2020',
  type: 'journal-article',
  authors: 'Durga Tanisandra Krishnappa, Sridhar, M. K., & Nagendra, H. R.',
  year: '2020',
  title: 'Concept of mind in Indian philosophy, Western philosophy, and psychology',
  container: 'Yoga Mimamsa',
  volume: '52',
  issue: '1',
  pages: '25–28',
  doi: '10.4103/ym.ym_24_19',
  asCited: [
    'Durga Tanisandra Krishnappa, Sridhar, M. K., & Nagendra, H. R. (2020a). Concept of mind in Indian philosophy, Western philosophy, and psychology. Yoga Mimamsa, 52(1), 25–28.',
    'Durga Tanisandra Krishnappa, Sridhar, M. K., & Nagendra, H. R. (2020b). Concept of mind in Indian philosophy, Western philosophy, and psychology. Yoga Mimamsa, 52(1), 25–28.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourmind/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'The year is stored as “2020”: the page lists this paper twice, as “(2020a)” and “(2020b)”, and its in-text citations write “2020”.',
      'Its link, “https://doi.org/10.4103/ym.ym_24_19”, is kept as the DOI.',
      'Interface text dropped: the “Read more” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'Know Your Mind lists this paper twice, as 2020a and 2020b, with the same authors, title, journal and DOI. Stored as one Reference, with both lines kept as cited. Confirm they are one work; nothing was looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
