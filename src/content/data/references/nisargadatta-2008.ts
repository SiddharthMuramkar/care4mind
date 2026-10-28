import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'nisargadatta-2008',
  type: 'book',
  authors: 'Nisargadatta, Maharaj',
  year: '2008',
  title: 'I am That: Talks with Sri Nisargadatta Maharaja',
  publisher: 'Chetana Publishing',
  url: 'https://www.amazon.in/I-Am-That-Nisargadatta-Maharaj/dp/0893860463',
  asCited: [
    'Nisargadatta, Maharaj. (2008). I Am That.',
    'Nisargadatta, Maharaj. (2008). I am That: Talks with Sri Nisargadatta Maharaja. (M. Frydman, Trans.). Mumbai: Chetana Publishing.',
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
