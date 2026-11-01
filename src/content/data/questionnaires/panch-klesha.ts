import { defineQuestionnaire } from '@/content/schema'

// The questionnaire the /panchkleshavikaarprofiling/ page describes, coming later (D12). The page
// holds none of its questions. Its score section is held back: described below, never quoted
// (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'panch-klesha',
  title: 'Panch Klesha – Vikaar Profiling',
  sourceTitle: 'Panch Klesha – Vikaar Profiling',
  status: 'coming-later',
  concepts: ['panch-klesha'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes this questionnaire but holds none of its questions, and its High, Moderate and Low texts come with no numbers or cut-offs. No scoring rules are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'The score indicator: for each of the five kleshas, under its own sub-heading (“I. Avidya (ignorance)”, “II. Asmita (Egoism)”, “III. Raga (Attachment)”, “IV. Dvesha (Aversion)” and “V. Abhinivesha (Fear of Death)”), three texts headed “High Score”, “Moderate Score” and “Low Score”, each saying what that klesha’s score at that level says about a person, with no numbers or cut-offs (15 texts); then the page’s note that the indicators were referred from Hridaya Yoga (2024) and Yogitim (2024), the References hridaya-yoga-2024 and yogitim-2024 on its reference list.',
      where:
        '/panchkleshavikaarprofiling/, the section “Score indicator”, after “Indian vs Western concept” and before the References',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/panchkleshavikaarprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'The title is the page’s own, “Panch Klesha – Vikaar Profiling”: the page gives its questionnaire no other name.',
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
