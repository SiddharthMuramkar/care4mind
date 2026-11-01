import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'yogapedia',
  type: 'web-page',
  authors: 'Yogapedia',
  year: 'n.d.',
  title: 'Yogapedia',
  url: 'https://www.yogapedia.com/',
  asCited: ['Yogapedia. (n.d.). Yogapedia.'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/panchkleshavikaarprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Read more.” link label.'],
    flags: [
      {
        for: 'research-editor',
        note: 'The page cites Yogapedia as a whole and links its home page, not a particular entry. Kept as given; confirm which entry was meant. Nothing was looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
