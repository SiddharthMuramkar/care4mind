import { defineQuestionnaire } from '@/content/schema'

// The coming-later Questionnaire of the /spiritualpractitionerprofiling/ page, titled by the name
// the page gives it, “Spiritual Practitioner Profile”. Its score section is held back, described
// here and shown nowhere (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'spiritual-practitioner',
  title: 'Spiritual Practitioner Profile',
  sourceTitle: 'Spiritual Practitioner Profiling',
  status: 'coming-later',
  concepts: ['spiritual-practitioner'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes score levels but gives no scoring rules or cut-offs; none are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'Three overall score indicators: what a high, a moderate and a low score says about a person.',
      where:
        'The page’s overall score indicator section, after “Indian vs Western Views”, under a heading for each level.',
    },
    {
      what: 'A note naming the source the score indicators were referred from: Ford et al. (2023), on the page’s reference list.',
      where: 'The last line of the overall score indicator section.',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/spiritualpractitionerprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Titled “Spiritual Practitioner Profile”, the name the page gives its questionnaire in its held-back score section; the page title is “Spiritual Practitioner Profiling”.',
      'The candidate source, Tomar (2024), is the Published scales research’s match (planning ticket 11); the page cites the book but doesn’t name a source for its questionnaire.',
      'Held back, described and never quoted: the page’s overall score indicator section, and its note on where the indicators were referred from.',
    ],
    flags: [
      {
        for: 'psychology-expert',
        note: 'The page says nothing about what its questionnaire measures outside its held-back score section, so no purpose is stored, and none was written. Write one, or approve leaving it out.',
        decidedBy: 'questionnaire-record',
      },
      {
        for: 'psychology-expert',
        note: 'The Concept’s definition says “such profiling” illuminates the psychological, ethical and behavioral characteristics of spiritual practitioners, citing a study (Sekagya et al., 2024). It describes profiling in general, not this questionnaire, so it stays in the Concept and is not taken as this record’s purpose.',
        decidedBy: 'questionnaire-record',
      },
    ],
  },
})
