import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'frankl-2008',
  type: 'book',
  authors: 'Frankl, V.',
  year: '2008',
  title: 'Man’s search for meaning',
  publisher: 'RHUK',
  edition: 'Exported Edition',
  url: 'https://www.amazon.in/Mans-Search-Meaning-Viktor-Frankl/dp/1846042844',
  asCited: [
    'Frankl, V. (2008). Man’s Search for Meaning.',
    'Frankl, V. (2008). Man’s search for meaning. RHUK, Exported Edition.',
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
    edits: [
      'Publisher and edition split out of “RHUK, Exported Edition”.',
      'Interface text dropped: the “Buy Now” link label.',
    ],
    flags: [
      {
        for: 'project-owner',
        note: 'Its only link on the current site goes to a retailer (Amazon), kept as its URL. Decide whether the site links to retailers, or to another page for the book.',
        ticket: 17,
      },
    ],
  },
})
