import { defineQuestionnaire } from '@/content/schema'

// The questionnaire the /knowyourmind/ page describes, coming later (D12), under the name its
// first heading gives it. The page holds none of its questions. Its score section is held back:
// described below, never quoted (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'chittabhumi',
  title: 'Know Your State of Mind Profile',
  sourceTitle: 'Know Your Mind',
  status: 'coming-later',
  concepts: ['chittabhumi'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes this questionnaire but holds none of its questions, and its High, Moderate and Low texts come with no numbers or cut-offs. No scoring rules are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'The score-based indicators: for each of the five states of mind, under its own sub-heading (“I. Mudha (Forgetful)”, “II. Kshipta”, “III. Vikshipta”, “IV. Ekagra” and “V. Niruddha”), three texts introduced by the lines “High Indicators”, “Moderate Indicators” and “Low Indicators”, each saying what that state’s score at that level says about a person, with no numbers or cut-offs (15 texts), most of them citing Krishnappa et al. (2020). Unlike the other mind pages, the section has no note saying where the indicators were referred from.',
      where:
        '/knowyourmind/, the section “Score- Based Indicators”, after “Correlates of five states of mind (Jayasheela & Salagame, 2018)” and before the References',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/knowyourmind/', retrieved: '2026-10-27' }],
    edits: [
      'The title is the name the page gives its questionnaire in its first heading, “Know Your State of Mind Profile”; the page’s own title is “Know Your Mind”.',
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
