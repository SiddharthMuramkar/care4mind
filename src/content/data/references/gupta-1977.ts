import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'gupta-1977',
  type: 'book',
  authors: 'Gupta',
  year: '1977',
  title:
    'Madhusudana Sarasvati On The Bhagavad Gita: Being An English Translation Of His Commentary, Gudhartha Dipika',
  publisher: 'Motilal Banarsidass',
  noStableLink: 'none given on the current site; not looked up',
  asCited: [
    'Gupta. (1977). Madhusudana Sarasvati On The Bhagavad Gita: Being An English Translation Of His Commentary, Gudhartha Dipika. Motilal Banarsidass.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/triguna/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [],
    flags: [
      {
        for: 'research-editor',
        note: 'The author is given only as “Gupta”, with no initials; nothing was looked up.',
        decidedBy: 'references',
      },
      {
        for: 'research-editor',
        note: 'No DOI or link is given on the current site; not looked up. Add a stable link if the work has one (FR-03).',
        decidedBy: 'references',
      },
    ],
  },
})
