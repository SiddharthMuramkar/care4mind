import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'yogananda-1946-1975',
  type: 'book',
  authors: 'Yogananda, P.',
  year: '1946/1975',
  title: 'Autobiography of a yogi',
  publisher: 'Jaico',
  url: 'https://www.amazon.in/Autobiography-Yogi-P-Yogananda/dp/818953551X',
  asCited: [
    'Yogananda, P. (1946/1975). Autobiography of a Yogi.',
    'Yogananda, P. (1946/1975). Autobiography of a yogi. Bombay: Jaico.',
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
