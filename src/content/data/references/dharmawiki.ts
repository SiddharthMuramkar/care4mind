import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'dharmawiki',
  type: 'web-page',
  title: 'DharmaWiki',
  url: 'https://dharmawiki.org/',
  asCited: ['DharmaWiki'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/triguna/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [],
    flags: [],
  },
})
