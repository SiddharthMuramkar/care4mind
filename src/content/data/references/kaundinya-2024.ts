import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'kaundinya-2024',
  type: 'journal-article',
  authors: 'Kaundinya, N.',
  year: '2024',
  title: 'Harmonizing dharma and democracy',
  container: 'Prayagraj Law Review',
  volume: '2',
  issue: '1',
  pages: '43–51',
  doi: '10.61120/plr.2023.v2143-51',
  asCited: [
    'Kaundinya, N. (2024). HARMONIZING DHARMA AND DEMOCRACY: Prayagraj Law Review., 2(1), 43–51.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/sthitaprajna/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'The title runs into the journal after a colon, “HARMONIZING DHARMA AND DEMOCRACY: Prayagraj Law Review.”: split into the title and the journal.',
      'Title in sentence case: “HARMONIZING DHARMA AND DEMOCRACY” → “Harmonizing dharma and democracy”.',
      'Its link, “https://doi.org/10.61120/plr.2023.v2143-51”, is kept as the DOI.',
      'Interface text dropped: the “Read more.” link label.',
    ],
    flags: [
      {
        for: 'research-editor',
        note: 'The page runs the title into the journal’s name after a colon (“HARMONIZING DHARMA AND DEMOCRACY: Prayagraj Law Review.”), so part of the title may be missing. Split there; nothing was looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
