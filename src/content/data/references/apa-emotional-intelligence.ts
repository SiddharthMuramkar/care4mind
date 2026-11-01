import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'apa-emotional-intelligence',
  type: 'dictionary-entry',
  authors: 'APA Dictionary of Psychology',
  year: 'n.d.',
  title: 'Emotional intelligence',
  url: 'https://dictionary.apa.org/emotional-intelligence',
  asCited: ['APA Dictionary of Psychology. (n.d.).'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/sthitaprajna/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'The page’s line gives no title; “Emotional intelligence” is taken from the address it links.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page’s reference line gives no title; “Emotional intelligence” is taken from the entry’s address. Confirm it.',
        decidedBy: 'references',
      },
    ],
  },
})
