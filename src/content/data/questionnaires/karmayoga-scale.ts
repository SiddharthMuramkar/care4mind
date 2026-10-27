import { defineQuestionnaire } from '@/content/schema'

export default defineQuestionnaire({
  kind: 'questionnaire',
  slug: 'karmayoga-scale',
  title: 'KarmaYoga Scale',
  sourceTitle: 'KarmaYoga Scale',
  status: 'preview',
  summary:
    'Statements about your everyday experience and your experience at work, rated by how often they apply and how far you agree.',
  purpose: [
    'The KarmaYoga Scale looks at karma yoga, an Indian perspective of work, through your own experience: first in everyday life, then at work.',
    'You read each statement and say how frequently or infrequently you have that experience, or how far you agree with it. Answer according to what really reflects your experience rather than what you think your experience should be, and treat each statement separately from every other.',
    'Its statements come from the Karma Yoga scale published by Navare and Pandey (2022).',
  ],
  format: [
    '45 statements in four parts: everyday experience (two parts) and experience related to work (two parts).',
    '21 statements are rated by how often they apply, from Always to Never.',
    '24 statements are rated by how far you agree, from Strongly Disagree to Strongly Agree.',
    'Every statement needs an answer before your result is shown.',
  ],
  concepts: ['vikshepa'],
  source: 'navare-pandey-2022',
  limitations: {
    items: [
      'This is a reflection exercise, not a clinical test. It does not diagnose anything and is not medical or psychological advice.',
      'Care4Mind makes no claim that this Questionnaire is valid for any purpose.',
      'Its scoring rules are still being confirmed. The Questionnaire opens here once they are, and its result will come only from those documented rules.',
      'If you are struggling, please talk to a qualified professional.',
    ],
    status: 'draft-pending-psychology-expert',
  },
  scoring: {
    status: 'pending',
    reason:
      'No scoring rules are documented for it, and the Psychology expert has approved none (FR-05). Planning tickets 26 and 28 decide them.',
  },
  heldBack: [],
  reviewStatus: 'drafted-not-reviewed',
  provenance: {
    sources: [{ url: 'https://care4mind.org/karmayoga-scale/', retrieved: '2026-10-27' }],
    edits: [
      // The front-end foundation's edits (planning ticket 21), kept as it wrote them.
      'Purpose and format are written from the current page’s four instruction steps and its 45 items; the items themselves are not copied here.',
      'The source citation comes from the planning map’s Published scales research (ticket 11), not from the current page, which cites no source.',
      'The limitations are a draft in the brief’s fallback wording. The Psychology expert owns them.',
    ],
    flags: [
      {
        for: 'psychology-expert',
        note: 'The summary, purpose, format and limitations were written by the front-end foundation from the quiz’s four instruction steps; none of it is on the current page. Approve or rewrite them.',
        ticket: 26,
      },
      {
        for: 'project-owner',
        note: 'Linked to the vikṣepa Concept for the preview only, because several of its statements are about distraction at work; the current page links no Concept. Planning ticket 14 decides its real links.',
        ticket: 14,
      },
    ],
    drafted: ['summary', 'purpose', 'format', 'limitations'],
  },
})
