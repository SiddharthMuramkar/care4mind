import { defineQuestionnaire } from '@/content/schema'

// The questionnaire the /knowyourvaluesasteyanonstealingprofiling/ page describes, coming later
// (D12). The page holds none of its questions. Its score section is held back: described below,
// never quoted (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'asteya',
  title: 'Know Your Values: Asteya (Non-Stealing) Profiling',
  sourceTitle: 'Know Your Values: Asteya (Non-Stealing) Profiling',
  status: 'coming-later',
  concepts: ['asteya'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes this questionnaire but holds none of its questions, and its High, Moderate and Low texts come with no numbers or cut-offs. No scoring rules are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'The overall score indicator: three texts, each headed “Score Wise Category Description” with High, Moderate or Low, each saying what an asteya score at that level says about a person, with no numbers or cut-offs; then the page’s note that its score indicators were referred from Dylan & Muncaster (2021) and Parmar (2014), the References dylan-muncaster-2021 and parmar-2014 on its reference list.',
      where:
        '/knowyourvaluesasteyanonstealingprofiling/, the sub-section “Overall Score Indicator”, the last under “Asteya (Non-Stealing) Profiling”, after “Absence of Asteya (Non-Stealing)” and before the References',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [
      {
        url: 'https://care4mind.org/knowyourvaluesasteyanonstealingprofiling/',
        retrieved: '2026-10-27',
      },
    ],
    edits: [
      'The title is the page’s own, “Know Your Values: Asteya (Non-Stealing) Profiling”: the page names its questionnaire only there. Its heading “Asteya (Non-Stealing) Profiling” heads the page’s definition of asteya, which the Concept keeps.',
      'Candidate source: Tomar (2024), whose contents research ticket 11 (Published scales) found this questionnaire in by name, as “Asteya (Non-Stealing) Profiling”. The page names no source for the questionnaire itself.',
      'No purpose: outside its held-back score section, the page says nothing about what its questionnaire measures.',
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
