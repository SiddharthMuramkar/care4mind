import { defineQuestionnaire } from '@/content/schema'

// The coming-later Questionnaire of the /brahmavihara/ page, titled by the name the page gives
// it, “Brahma Vihara Profile”. Its score section is held back, described here and shown nowhere
// (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'brahma-vihara',
  title: 'Brahma Vihara Profile',
  sourceTitle: 'Brahma Vihara',
  status: 'coming-later',
  concepts: ['brahma-vihara'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes score levels but gives no scoring rules or cut-offs; none are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'Three score-based indicators: what a high, a moderate and a low overall score says about a person.',
      where: 'The page’s score-based indicators section, after “Disturbances in Brahma Vihara”.',
    },
    {
      what: 'A line saying that further distinctions are made for each component from section-wise scores.',
      where: 'The same section, after the three indicators.',
    },
    {
      what: 'A note naming the source all the score-based indicators were referred from: Sarkar (2019), on the page’s reference list.',
      where: 'The last line of the score-based indicators section.',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/brahmavihara/', retrieved: '2026-10-27' }],
    edits: [
      'Titled “Brahma Vihara Profile”, the name the page gives its questionnaire in its held-back score section; the page title is “Brahma Vihara”.',
      'The candidate source, Tomar (2024), is the Published scales research’s match (planning ticket 11); the page cites the book but doesn’t name a source for its questionnaire.',
      'Held back, described and never quoted: the page’s score-based indicators section, its line about section-wise scores, and its note on where the indicators were referred from.',
    ],
    flags: [
      {
        for: 'psychology-expert',
        note: 'The page says nothing about what its questionnaire measures outside its held-back score section, so no purpose is stored, and none was written. Write one, or approve leaving it out.',
        ticket: 26,
      },
    ],
  },
})
