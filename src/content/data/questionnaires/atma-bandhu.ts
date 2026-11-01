import { defineQuestionnaire } from '@/content/schema'

// The questionnaire the /frienorfoeofself/ page describes, coming later (D12). The page holds
// none of its questions and gives it no name but its title. Its score section is held back:
// described below, never quoted (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'atma-bandhu',
  title: 'Are you a Friend/Foe of Yourself?',
  sourceTitle: 'Are you a Friend/Foe of Yourself?',
  status: 'coming-later',
  concepts: ['atma-bandhu'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes this questionnaire but holds none of its questions, and its High, Moderate and Low texts come with no numbers or cut-offs. No scoring rules are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'The scoring continuum: a line, set as a sub-heading, laying out three levels, high, moderate and low, and the term, or the balance of the two terms, that each level stands for.',
      where:
        '/frienorfoeofself/, the section “Scoring Continuum”, the last sub-section of “Contrast with Western Psychology”, after “Critical Theoretical Connections in Indian Philosophy”',
    },
    {
      what: 'Three indicator texts, headed “High Indicators”, “Moderate Indicators” and “Low Indicators”, of two, two and four paragraphs, each saying what a score at that level says about a person, with no numbers or cut-offs. They cite Hegde & Nayak (2025) and Paranjpe (2010), the References hegde-nayak-2025 and paranjpe-2010 on its reference list, and verses 6.5, 2.48 and 9.27 of the Bhagavad Gītā. The section has no note saying where the indicators were referred from.',
      where:
        'The same section, after the continuum and before “Self Management Strategies Propounded by Bhagavat Gita”',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/frienorfoeofself/', retrieved: '2026-10-27' }],
    edits: [
      'The title is the page’s own, “Are you a Friend/Foe of Yourself?”: the page gives its questionnaire no other name.',
      'Candidate source: Tomar (2024), whose contents research ticket 11 (Published scales) found this questionnaire in by name. The page names no source for the questionnaire itself.',
      'Held back, described and never quoted: the page’s “Scoring Continuum” section, with its continuum line and its three indicator texts.',
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
