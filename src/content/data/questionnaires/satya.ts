import { defineQuestionnaire } from '@/content/schema'

// The questionnaire the /knowyourvaluessatyatruthfulnessprofiling/ page describes, coming later
// (D12). The page holds none of its questions. Its score section is held back: described below,
// never quoted (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'satya',
  title: 'Know Your Values: Satya (Truthfulness) Profiling',
  sourceTitle: 'Know Your Values: Satya (Truthfulness) Profiling',
  status: 'coming-later',
  concepts: ['satya'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes this questionnaire but holds none of its questions, and its High, Moderate and Low texts come with no numbers or cut-offs. No scoring rules are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'The overall score indicator: three texts, each headed “Score Wise Category Description” with High, Moderate or Low, each saying what a satya score at that level says about a person, with no numbers or cut-offs; then the page’s note that its score indicators were referred from Agrawal & Aldons (2023), the Reference agrawal-aldons-2023 on its reference list.',
      where:
        '/knowyourvaluessatyatruthfulnessprofiling/, the section “Overall Score Indicator”, after “Absence of Satya (Truthfulness)” and before the References',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'The title is the page’s own, “Know Your Values: Satya (Truthfulness) Profiling”: the page names its questionnaire only there. Its heading “Satya (Truthfulness) Profiling” heads the page’s definition of satya, which the Concept keeps.',
      'Candidate source: Tomar (2024), whose contents research ticket 11 (Published scales) found this questionnaire in by name, as “Satya (Truthfulness) Profiling”. The page names no source for the questionnaire itself.',
      'No purpose: outside its held-back score section, the page says nothing about what its questionnaire measures.',
    ],
    flags: [],
  },
})
