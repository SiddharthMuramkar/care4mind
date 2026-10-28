import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'khalil-2001',
  type: 'book',
  authors: 'Khalil, G.',
  year: '2001',
  title: 'The prophet',
  publisher: 'Alfred. A. Knopf Inc.',
  url: 'https://www.amazon.in/Prophet-Kahlil-Gibran/dp/8129105632',
  asCited: [
    'Khalil, G. (2001). The Prophet.',
    'Khalil, G. (2001). The prophet. New York: Alfred. A. Knopf Inc.',
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
        note: 'The pages write the author “Khalil, G.”, as if Khalil were the surname; Inspirational Books’ own description calls him “Khalil Gibran”, and Text Books’ link address reads “Kahlil-Gibran”. Kept as written; nothing was looked up.',
        ticket: 17,
      },
      {
        for: 'project-owner',
        note: 'Its only link on the current site goes to a retailer (Amazon), kept as its URL. Decide whether the site links to retailers, or to another page for the book.',
        ticket: 17,
      },
    ],
  },
})
