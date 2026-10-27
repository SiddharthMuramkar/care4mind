import { defineQuestionnaire } from '@/content/schema'

// The questionnaire the /knowyourvaluesahimsanon-violenceprofiling/ page describes, coming later
// (D12). The page holds none of its questions. Its score section is held back: described below,
// never quoted (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'ahimsa',
  title: 'Know Your Values: Ahimsa (Non-Violence) Profiling',
  sourceTitle: 'Know Your Values: Ahimsa (Non-Violence) Profiling',
  status: 'coming-later',
  concepts: ['ahimsa'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes this questionnaire but holds none of its questions, and its High, Moderate and Low texts come with no numbers or cut-offs. No scoring rules are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'The overall score indicator: three texts, each headed “Score Wise Category Description” with High, Moderate or Low, each saying what an ahiṃsā score at that level says about a person, with no numbers or cut-offs; then the page’s note that its score indicators were referred from Sudrajat and Universitas Pendidikan Indonesia (2017), the Reference sudrajat-2017 on its reference list.',
      where:
        '/knowyourvaluesahimsanon-violenceprofiling/, the section “Overall Score indicator”, after “Absence of Ahimsa” and before the References',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesahimsanon-violenceprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'The title is the page’s own, “Know Your Values: Ahimsa (Non-Violence) Profiling”: the page names its questionnaire only there. Its sub-heading “Ahimsa (Non-Violence) Profiling” heads the page’s definition of ahiṃsā, which the Concept keeps.',
      'Candidate source: Tomar (2024), whose contents research ticket 11 (Published scales) found this questionnaire in by name, as “Ahimsa (Non-Violence) Profiling”. The page names no source for the questionnaire itself.',
      'No purpose: outside its held-back score section, the page says nothing about what its questionnaire measures.',
    ],
    flags: [],
  },
})
