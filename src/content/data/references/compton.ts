import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'compton',
  type: 'book',
  authors: 'William Compton',
  title: 'Introduction to Positive Psychology',
  url: 'http://www.amazon.com/Introduction-Positive-Psychology-William-Compton/dp/0534644538/ref=sr_1_1/102-7915503-0530536?ie=UTF8&s=books&qid=1194903965&sr=8-1',
  asCited: ['Introduction to Positive Psychology by William Compton'],
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
        decidedBy: 'references',
      },
      {
        for: 'research-editor',
        note: 'No year or publisher is given on the current site; not looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
