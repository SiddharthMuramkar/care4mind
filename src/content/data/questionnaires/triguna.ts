import { defineQuestionnaire } from '@/content/schema'

// The questionnaire the /triguna/ page describes, coming later (D12), under the name its section
// heading gives it. The page holds none of its questions. The section's first sentence says what
// it estimates and is its purpose; the rest, a table of score-level characteristics and its
// lead-in, is held back: described below, never quoted (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'triguna',
  title: 'Triguna Profile Questionnaire',
  sourceTitle: 'Triguna',
  status: 'coming-later',
  purpose: [
    'A Triguna Profile Questionnaire is a tool to estimate the characteristics of Trigunas in a person.',
  ],
  concepts: ['triguna'],
  candidateSource: 'tomar-2024',
  scoring: {
    status: 'pending',
    reason:
      'The page describes this questionnaire but holds none of its questions, and its table of High, Moderate and Low characteristics comes with no numbers or cut-offs. No scoring rules are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'A table of characteristics, with a row for each guṇa (Sattva, Rajas and Tamas) and a column for each of three levels, high, moderate and low, each cell saying what a person with that guṇa at that level is like, with no numbers or cut-offs (9 cells); and the sentence leading into it, which attributes the characteristics to Murthy & Kumar (2007), the Reference murthy-kiran-kumar-2007 on the page’s reference list.',
      where:
        '/triguna/, the section “Triguna Profile Questionnaire”, after its first sentence and before Bhagavad Gītā 14.9. The design notes place this text in “Guna Predominance”; on the saved page that section holds Bhagavad Gītā 14.11–14.13, which the Concept keeps.',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/triguna/', retrieved: '2026-10-27' }],
    edits: [
      'The title is the name the page gives its questionnaire, the heading of its section “Triguna Profile Questionnaire”; the page’s own title is “Triguna”.',
      'The purpose is the first sentence of that section, with the levels it names left out, since no record holds score-level wording (FR-05): “A Triguna Profile Questionnaire is a tool to estimate the high and low characteristics of Trigunas in a person.” → “A Triguna Profile Questionnaire is a tool to estimate the characteristics of Trigunas in a person.”',
      'Candidate source: Tomar (2024), whose contents research ticket 11 (Published scales) found this questionnaire in by name. The page names no source for the questionnaire itself.',
      'Held back, described and never quoted: the section’s table of characteristics and the sentence leading into it.',
    ],
    flags: [
      {
        for: 'psychology-expert',
        note: 'The purpose is the page’s own sentence, “A Triguna Profile Questionnaire is a tool to estimate the high and low characteristics of Trigunas in a person.”, with “high and low” left out, since no record holds score-level wording. It says what the questionnaire measures and interprets no score. Approve it, rewrite it, or leave it out.',
        ticket: 26,
      },
    ],
  },
})
