import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'shlokam-2020-yogasutra',
  type: 'web-page',
  authors: 'Shlokam.org',
  year: '2020, November 22',
  title: 'Yogasutra Verses in Sanskrit, English with Commentary',
  container: 'Shlokam',
  url: 'https://shlokam.org/yogasutra/',
  asCited: [
    'Shlokam.org. (2020, November 22). Yogasutra Verses in Sanskrit, English with Commentary. Shlokam.',
    'Yogasutra Verses – Patanjali’s Yogasutra. (2020, November 22).',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/momentumofspiritualpractice/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/karta-2/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Read more.” and “View verses” link labels.'],
    flags: [
      {
        for: 'research-editor',
        note: 'Two pages cite this Shlokam page (https://shlokam.org/yogasutra/, 2020, November 22) under two titles: “Yogasutra Verses in Sanskrit, English with Commentary” on Momentum of Spiritual Practice and “Yogasutra Verses – Patanjali’s Yogasutra” on Karta. Stored as one Reference with both lines kept as cited and the first title. Confirm the title; nothing was looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
