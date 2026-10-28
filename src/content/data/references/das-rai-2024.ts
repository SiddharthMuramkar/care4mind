import { defineReference } from '@/content/schema'

export default defineReference({
  kind: 'reference',
  id: 'das-rai-2024',
  type: 'journal-article',
  authors: 'Das, A., & Rai, R.',
  year: '2024',
  title:
    'Exploring Mental Well-being from the Perspective of the Indian Knowledge System with Special Reference to…',
  container: 'ResearchGate',
  volume: '55',
  issue: '2',
  pages: '119–137',
  url: 'https://www.researchgate.net/publication/391985328_Exploring_Mental_Well-being_from_the_Perspective_of_the_Indian_Knowledge_System_with_Special_Reference_to_Patanjali_Yoga_Sutra_and_Bhagavad_Gita',
  asCited: [
    'Das, A., & Rai, R. (2024). Exploring Mental Well-being from the Perspective of the Indian Knowledge System with Special Reference to… ResearchGate, 55(2), 119–137.',
  ],
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourmind/',
        retrieved: '2026-10-27',
      },
    ],
    edits: ['Interface text dropped: the “Read more” link label.'],
    flags: [
      {
        for: 'research-editor',
        note: 'The page’s title stops at “with Special Reference to…”, cut short (the address of its link continues it), and gives ResearchGate, the site that holds the paper, as its journal. Kept as given; nothing was looked up.',
        ticket: 17,
      },
    ],
  },
})
