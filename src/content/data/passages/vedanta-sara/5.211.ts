import { definePassage } from '@/content/schema'

export default definePassage({
  kind: 'passage',
  id: 'vedanta-sara/5.211',
  work: 'vedanta-sara',
  locator: '5.211',
  order: [5, 211],
  devanagari: ['अखण्ड वास्तु अनवलम्बनेन', 'चित्त वृत्तिः अन्यावलम्बनं विक्षेपः'],
  transliteration: {
    lines: ['akhanda vastu anavalambanena', 'chitta vritteh anyaavalambanam, vikshepah.'],
    scheme: 'informal',
  },
  translations: [
    {
      id: 'vikshepa',
      text: 'The effort to rest on the Absolute fails due to the mental state resting on something else (other desires). This is Vikshepa or Distraction (unsteadiness).',
    },
  ],
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: [
      'The verse number after the last line is left out, since the locator holds it: “ ५।२११” → “” and “ 5.211” → “”.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The Devanagari reads “वास्तु” where the transliteration reads “vastu”; not changed.',
        ticket: 16,
      },
    ],
  },
})
