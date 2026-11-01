import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'mascaro-1994-upanisads',
  type: 'book',
  authors: 'Mascaro, J.',
  year: '1994',
  title: 'The Upanisads',
  publisher: 'Penguin Books India',
  url: 'https://www.amazon.in/Upanishads-Penguin-Classics/dp/0140447490',
  asCited: [
    'Mascaro, J. (1994). The Upanishads.',
    'Mascaro, J. (1994). The Upanisads. New Delhi: Penguin Books India.',
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
        for: 'research-editor',
        note: 'The title is spelled “The Upanisads” on Inspirational Books and “The Upanishads” on Text Books; the record keeps the first, from the fuller line, and both lines as cited. Nothing was looked up.',
        decidedBy: 'references',
      },
      {
        for: 'project-owner',
        note: 'Its only link on the current site goes to a retailer (Amazon), kept as its URL. Decide whether the site links to retailers, or to another page for the book.',
        decidedBy: 'references',
      },
    ],
  },
})
