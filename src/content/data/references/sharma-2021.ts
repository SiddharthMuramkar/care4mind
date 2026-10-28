import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'sharma-2021',
  type: 'journal-article',
  authors: 'Sharma, M.',
  year: '2021',
  title:
    'Indian Psychology- exploring the historical roots, emerging trends and future implications',
  container: 'International Journal of Indian Psychology',
  volume: '9',
  issue: '2',
  doi: '10.25215/0902.168',
  asCited: [
    'Sharma, M. (2021). Indian Psychology- exploring the historical roots, emerging trends and future implications. International Journal of Indian Psychology, 9(2).',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/panchkleshavikaarprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Its link, “https://doi.org/10.25215/0902.168”, is kept as the DOI.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
