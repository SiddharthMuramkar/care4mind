import { defineQuestionnaire } from '@/content/schema'

// The questionnaire the /karta-2/ page describes, coming later (D12), under the name its first
// heading gives it. The page holds none of its questions. Its whole score section is held back:
// described below, never quoted (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'karta',
  title: 'Karta Profile',
  sourceTitle: 'Karta',
  status: 'coming-later',
  concepts: ['karta'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes this questionnaire but holds none of its questions: it gives only the range each type of doer is scored on, and its Low, Moderate and High lines come with no cut-offs. No scoring rules are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'A line saying what range of numbers each of the three types of doer is scored on.',
      where:
        '/karta-2/, the first line of the section “Karta Score-Based Indicators”, after the comparative table on karma and determinism',
    },
    {
      what: 'For each type, Sattvik, Rajasic and Tamasic Karta, under a sub-heading naming it with an English epithet: a paragraph describing that type of doer, a line of its traits, and three lines headed Low, Moderate and High, each saying what that type’s score at that level says about a person, with no cut-offs (9 lines). They cite Tomar (2024), Paranjpe (1996) and Rao & Paranjpe (2016), all on the page’s reference list; the section has no note saying where its indicators were referred from.',
      where: 'The rest of the section “Karta Score-Based Indicators”, before the References',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/karta-2/', retrieved: '2026-10-27' }],
    edits: [
      'The title is the name the page gives its questionnaire in its first heading, “Karta Profile Introduction”: “Karta Profile”. The page’s own title is “Karta”.',
      'Candidate source: Tomar (2024), whose contents research ticket 11 (Published scales) found this questionnaire in by name. The page names no source for the questionnaire itself.',
      'Held back, described and never quoted: the whole “Karta Score-Based Indicators” section, with its line on how each type is scored and, for each type, its description, traits and Low, Moderate and High lines.',
    ],
    flags: [
      {
        for: 'psychology-expert',
        note: 'The page says nothing about what its questionnaire measures outside its held-back score section, so no purpose is stored, and none was written. Write one, or approve leaving it out.',
        ticket: 26,
      },
      {
        for: 'project-owner',
        note: 'The held-back “Karta Score-Based Indicators” section also describes each type of doer in a paragraph that interprets no score, and the Concept kartā doesn’t carry those paragraphs. Decide whether they belong on the Concept page once the score text is reviewed.',
        ticket: 19,
      },
    ],
  },
})
