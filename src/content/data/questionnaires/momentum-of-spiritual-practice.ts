import { defineQuestionnaire } from '@/content/schema'

// The coming-later Questionnaire of the /momentumofspiritualpractice/ page, which gives its
// questionnaire no name but its title. Its score section is held back, described here and shown
// nowhere (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'momentum-of-spiritual-practice',
  title: 'Momentum of Spiritual Practice',
  sourceTitle: 'Momentum of Spiritual Practice',
  status: 'coming-later',
  concepts: ['momentum-of-spiritual-practice'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes score levels but gives no scoring rules or cut-offs; none are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'Three score-wise category descriptions: what a high, a moderate and a low overall score says about a person.',
      where: 'The page’s overall score indicator section, after “Absence of Spirituality”.',
    },
    {
      what: 'A note naming the source the score indicators were referred from: Fopka-Kowalczyk et al. (2022), on the page’s reference list.',
      where: 'The last line of the overall score indicator section.',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/momentumofspiritualpractice/', retrieved: '2026-10-27' },
    ],
    edits: [
      'The candidate source, Tomar (2024), is the Published scales research’s match (planning ticket 11); the page cites the book but doesn’t name a source for its questionnaire.',
      'Held back, described and never quoted: the page’s overall score indicator section, and its note on where the indicators were referred from.',
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
