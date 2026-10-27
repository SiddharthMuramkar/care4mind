import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'boniwell',
  type: 'book',
  authors: 'Ilona Boniwell',
  title: 'Positive Psychology in a Nutshell: The Science of Happiness',
  url: 'http://www.amazon.com/Positive-Psychology-In-Nutshell-Happiness-ebook/dp/B00A9SP50S/ref=dp_kinw_strp_1',
  asCited: ['Positive Psychology in a Nutshell: The Science of Happiness by Ilona Boniwell'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/positive-psychology/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [],
    flags: [
      {
        for: 'project-owner',
        note: 'Its only link on the current site goes to a retailer (Amazon), kept as its URL. Decide whether the site links to retailers, or to another page for the book.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'No year or publisher is given on the current site; not looked up.',
        ticket: 17,
      },
    ],
  },
})
