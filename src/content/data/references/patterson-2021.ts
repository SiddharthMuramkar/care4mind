import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'patterson-2021',
  type: 'journal-article',
  authors:
    'Patterson, H., Firebaugh, C. M., Zolnikov, T. R., Wardlow, R., Morgan, S. M., & Gordon, B.',
  year: '2021',
  title:
    'A systematic review on the psychological effects of perfectionism and accompanying treatment',
  container: 'Psychology',
  volume: '12',
  issue: '01',
  pages: '1–24',
  doi: '10.4236/psych.2021.121001',
  asCited: [
    'Patterson, H., Firebaugh, C. M., Zolnikov, T. R., Wardlow, R., Morgan, S. M., & Gordon, B. (2021). A systematic review on the psychological effects of perfectionism and accompanying treatment. Psychology, 12(01), 1–24.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/fivestepsofperfectionprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Its link, “https://doi.org/10.4236/psych.2021.121001”, is kept as the DOI.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
