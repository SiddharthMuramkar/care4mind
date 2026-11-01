import { defineQuestionnaire } from '@/content/schema'

// The questionnaire the /sthitaprajna/ page describes, coming later (D12). The page holds none of
// its questions, and research ticket 11 found no published source for it, so it has no candidate
// source. Its score section is held back: described below, never quoted (FR-05).
export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'sthitaprajna',
  title: 'Sthitaprajna',
  sourceTitle: 'Sthitaprajna',
  status: 'coming-later',
  concepts: ['sthitaprajna'],
  scoring: {
    status: 'pending',
    reason:
      'The page describes this questionnaire but holds none of its questions, and its High, Moderate and Low texts come with no numbers or cut-offs. No scoring rules are documented, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [
    {
      what: 'The overall score indicator: three texts, under “High indicators”, “Moderate Indicators” and “Low Indicators”, each saying what a sthitaprajña score at that level says about a person, with no numbers or cut-offs; then the page’s note that the indicators were referred from www.wisdomlib.org (2022b), the Reference wisdomlib-2022 on its reference list.',
      where:
        '/sthitaprajna/, the section “Overall Score indicator”, after “Absence of Sthitaprajna” and before the References',
    },
  ],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/sthitaprajna/', retrieved: '2026-10-27' }],
    edits: [
      'The title is the page’s own, “Sthitaprajna”: the page gives its questionnaire no other name.',
      'No candidate source: research ticket 11 (Published scales) found no published source for this questionnaire, and the page names none for it.',
    ],
    flags: [
      {
        for: 'psychology-expert',
        note: 'No published source was found for this questionnaire (research ticket 11): Tomar (2024), which 14 of the 16 description pages’ questionnaires match by name, has none by this name in its searchable text. The record has no candidate source. Confirm where its questions come from before it is offered; nothing was looked up.',
        decidedBy: 'questionnaire-scope',
      },
      {
        for: 'psychology-expert',
        note: 'The page says nothing about what its questionnaire measures outside its held-back score section, so no purpose is stored, and none was written. Write one, or approve leaving it out.',
        decidedBy: 'questionnaire-record',
      },
    ],
  },
})
