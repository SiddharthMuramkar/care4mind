import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'apa-distraction',
  type: 'dictionary-entry',
  authors: 'APA Dictionary of Psychology',
  year: 'n.d.-b',
  title: 'Distraction',
  url: 'https://dictionary.apa.org/distraction',
  asCited: ['APA Dictionary of Psychology. (n.d.-b).'],
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: [
      'The page’s line gives no title; “Distraction” is taken from the address it links.',
      'Link moved to https: “http://dictionary.apa.org/distraction” → “https://dictionary.apa.org/distraction”.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page’s reference line gives no title; “Distraction” is taken from the entry’s address. Confirm it.',
        decidedBy: 'references',
      },
    ],
  },
})
