import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'mascaro-1994-gita',
  type: 'book',
  authors: 'Mascaro, J.',
  year: '1994',
  title: 'The Bhagavad Gita',
  publisher: 'Penguin Books India',
  url: 'https://www.amazon.in/Bhagavad-Gita-Penguin-Classics/dp/0140449183',
  asCited: [
    'Mascaro, J. (1994). The Bhagavad Gita.',
    'Mascaro, J. (1994). The Bhagavad Gita. New Delhi: Penguin Books India.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/text-books/',
        retrieved: '2026-10-27',
      },
      {
        url: 'https://care4mind.org/inspirational-books/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Buy Now” link label.'],
    flags: [
      {
        for: 'project-owner',
        note: 'Its only link on the current site goes to a retailer (Amazon), kept as its URL. Decide whether the site links to retailers, or to another page for the book.',
        decidedBy: 'references',
      },
    ],
  },
})
