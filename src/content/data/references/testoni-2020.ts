import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'testoni-2020',
  type: 'journal-article',
  authors: 'Testoni, I., Wieser, M. A., Kapelis, D., Pompele, S., Bonaventura, M., & Crupi, R.',
  year: '2020',
  title:
    'Lack of Truth-Telling in Palliative Care and Its Effects among Nurses and Nursing Students',
  container: 'Behavioral Sciences',
  volume: '10',
  issue: '5',
  pages: '88',
  doi: '10.3390/bs10050088',
  asCited: [
    'Testoni, I., Wieser, M. A., Kapelis, D., Pompele, S., Bonaventura, M., & Crupi, R. (2020). Lack of Truth-Telling in Palliative Care and Its Effects among Nurses and Nursing Students. Behavioral Sciences, 10(5), 88.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Its link, “https://doi.org/10.3390/bs10050088”, is kept as the DOI.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
