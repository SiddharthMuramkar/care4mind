import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'gupta-2013',
  type: 'book',
  authors: 'Gupta, M.',
  year: '2013',
  title: 'The gospel of Sri Ramakrishna',
  publisher: 'Sri Ramakrishna Math',
  url: 'https://www.amazon.in/Gospel-Ramakrishna-M/dp/0911206024',
  asCited: [
    'Gupta, M. (2013). The Gospel of Sri Ramakrishna.',
    'Gupta, M. (2013). The gospel of Sri Ramakrishna. Chennai: Sri Ramakrishna Math.',
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
