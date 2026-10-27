import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'ford-2023',
  type: 'journal-article',
  authors: 'Ford, T., Lipson, J., & Miller, L.',
  year: '2023',
  title: 'Spiritually grounded character: A latent profile analysis',
  container: 'Frontiers in Psychology',
  volume: '13',
  doi: '10.3389/fpsyg.2022.1061416',
  asCited: [
    'Ford, T., Lipson, J., & Miller, L. (2023). Spiritually grounded character: A latent profile analysis. Frontiers in Psychology, 13.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/spiritualpractitionerprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Its link, “https://doi.org/10.3389/fpsyg.2022.1061416”, is kept as the DOI.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [],
  },
})
