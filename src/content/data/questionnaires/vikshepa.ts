import { defineQuestionnaire } from '@/content/schema'

// The questionnaire the /vikshepa/ page describes, coming later (D12). The page holds none of its
// questions. Its score section is held back: described below, never quoted (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'vikshepa',
  title: 'Vikshepa (Distraction)',
  sourceTitle: 'Vikshepa (Distraction)',
  status: 'coming-later',
  concepts: ['vikshepa'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes this questionnaire but holds none of its questions, and its High, Moderate and Low texts come with no numbers or cut-offs. No scoring rules are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'The overall score indicator: three texts, under “High indicators”, “Moderate Indicators” and “Low Indicators”, each saying what a vikṣepa score at that level says about a person, with no numbers or cut-offs; then the page’s note that the indicators were referred from Yoga Sutras of Patanjali 1.30–1.32: Obstacles and solutions (n.d.-b), the Reference swamij-1-30 on its reference list.',
      where:
        '/vikshepa/, the section “Overall Score indicator”, after “Indian vs Western concept” and before the References',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/vikshepa/', retrieved: '2026-10-27' }],
    edits: [
      'The title is the page’s own, “Vikshepa (Distraction)”: the page gives its questionnaire no other name.',
      'Candidate source: Tomar (2024), whose contents research ticket 11 (Published scales) found this questionnaire in by name. The page names no source for the questionnaire itself.',
    ],
    flags: [
      {
        for: 'psychology-expert',
        note: 'The page says nothing about what its questionnaire measures outside its held-back score section, so no purpose is stored, and none was written. Write one, or approve leaving it out.',
        decidedBy: 'questionnaire-record',
      },
    ],
  },
})
