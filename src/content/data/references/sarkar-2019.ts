import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'sarkar-2019',
  type: 'journal-article',
  authors: 'Sarkar, B. K.',
  year: '2019',
  title: 'Buddhists Concept of Brahma-Vihar: An Analysis of Morals',
  noStableLink:
    'none kept: the page’s only link is a PDF under a WordPress uploads address, which the content rules keep out of records; not looked up',
  asCited: ['Sarkar, B. K. (2019). Buddhists Concept of Brahma-Vihar: An Analysis of Morals.'],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/brahmavihara/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'Its link, a PDF on old.rrjournals.com under a WordPress uploads address, is left out: the content rules keep such addresses out of records.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page links this paper as a PDF on old.rrjournals.com, under a WordPress uploads address, which the content rules keep out of records; the link is left out and nothing was looked up. Give a stable link for it, such as a DOI or the journal’s article page.',
        ticket: 17,
      },
      {
        for: 'research-editor',
        note: 'No journal (container) is given on the current site; not looked up.',
        ticket: 17,
      },
    ],
  },
})
