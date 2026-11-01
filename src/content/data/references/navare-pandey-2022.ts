import { defineReference } from '@/content/schema'

// No page of the current site cites this paper: the KarmaYoga Scale's statements come from it,
// as the Published scales research (planning ticket 11) found. Its fields come from that
// research, so verify lists this record as unchecked.
export default defineReference({
  kind: 'reference',
  id: 'navare-pandey-2022',
  type: 'journal-article',
  authors: 'Navare, A., & Pandey, A.',
  year: '2022',
  title:
    'Karma Yoga: Scale development and studies of the impact on positive psychological outcomes at the workplace',
  container: 'International Journal of Cross Cultural Management',
  volume: '22',
  issue: '2',
  pages: '271–299',
  doi: '10.1177/14705958221111239',
  asCited: [],
  provenance: {
    sources: [{ url: 'https://doi.org/10.1177/14705958221111239', retrieved: '2026-10-26' }],
    edits: [],
    flags: [
      {
        for: 'research-editor',
        note: 'Taken from the Published scales research (planning ticket 11), which read excerpts of the paper, not from a page of the current site. Check the fields against the paper.',
      },
    ],
  },
})
