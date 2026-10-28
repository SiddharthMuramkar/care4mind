import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'gandhi-1993',
  type: 'book',
  authors: 'Gandhi, M. K.',
  year: '1993',
  title: 'My experiments with truth',
  publisher: 'Beacon Press',
  url: 'https://www.amazon.in/My-Experiments-Truth-Mahatma-Gandhi/dp/0143330098',
  asCited: [
    'Gandhi, M. K. (1993). My Experiments with Truth.',
    'Gandhi, M. K. (1993). My experiments with truth. New Delhi: Beacon Press.',
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
        ticket: 17,
      },
    ],
  },
})
