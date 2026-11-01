import { defineQuestionnaire } from '@/content/schema'

// The coming-later Questionnaire of the /fivestepsofperfectionprofiling/ page. The page gives its
// questionnaire no name but its title, and no published source for it was found (research
// ticket 11). Its score section is held back, described here and shown nowhere (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'five-steps-of-perfection',
  title: 'Five Steps of Perfection Profiling',
  sourceTitle: 'Five Steps of Perfection Profiling',
  status: 'coming-later',
  concepts: ['five-steps-of-perfection'],
  scoring: {
    status: 'pending',
    reason:
      'The page describes score levels but gives no scoring rules or cut-offs; none are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'Fifteen score-wise category descriptions: for each of the five steps, what a high, a moderate and a low score says about a person.',
      where:
        'The page’s score indicator section, after “Consequences of Perfection”, under a heading for each step.',
    },
    {
      what: 'A note naming the three sources the score indicators were referred from: a wisdomlib.org page and Indurkar (n.d.), both on the page’s reference list, and a third source that isn’t on it.',
      where: 'The last line of the score indicator section.',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [
      { url: 'https://care4mind.org/fivestepsofperfectionprofiling/', retrieved: '2026-10-27' },
    ],
    edits: [
      'Held back, described and never quoted: the page’s score indicator section, and its note on where the indicators were referred from.',
    ],
    flags: [
      {
        for: 'psychology-expert',
        note: 'No published source was found for this questionnaire: the Published scales research (planning ticket 11) didn’t find Five Steps of Perfection in the searchable text of Tomar (2024), which the page cites, so the record names no candidate source. Decide whether it can be offered without one.',
        decidedBy: 'questionnaire-scope',
      },
      {
        for: 'psychology-expert',
        note: 'The page says nothing about what its questionnaire measures outside its held-back score section, so no purpose is stored, and none was written. Write one, or approve leaving it out.',
        decidedBy: 'questionnaire-record',
      },
      {
        for: 'research-editor',
        note: 'The held-back note on where the score indicators were referred from also cites “Samhita, 2024”, which isn’t on the page’s reference list. Nothing was looked up.',
        decidedBy: 'references',
      },
    ],
  },
})
