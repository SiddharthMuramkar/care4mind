import type { Questionnaire } from '../types'

export const karmayogaScale: Questionnaire = {
  slug: 'karmayoga-scale',
  title: 'KarmaYoga Scale',
  availability: 'coming-soon',
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
  source: {
    id: 'navare-pandey-2022',
    authors: 'Navare, A., & Pandey, A.',
    year: '2022',
    title:
      'Karma Yoga: Scale development and studies of the impact on positive psychological outcomes at the workplace',
    publication: 'International Journal of Cross Cultural Management, 22(2), 271–299',
    doi: '10.1177/14705958221111239',
  },
  limitations: {
    items: [
      'This is a reflection exercise, not a clinical test. It does not diagnose anything and is not medical or psychological advice.',
      'Care4Mind makes no claim that this Questionnaire is valid for any purpose.',
      'Its scoring rules are still being confirmed. The Questionnaire opens here once they are, and its result will come only from those documented rules.',
      'If you are struggling, please talk to a qualified professional.',
    ],
    status: 'draft-pending-psychology-expert',
  },
  relatedConcepts: ['vikshepa'],
  reviewStatus: 'carried-over-not-reviewed',
  provenance: {
    url: 'https://care4mind.org/karmayoga-scale/',
    retrieved: '2026-10-27',
    edits: [
      'Purpose and format are written from the current page’s four instruction steps and its 45 items; the items themselves are not copied here.',
      'The source citation comes from the planning map’s Published scales research (ticket 11), not from the current page, which cites no source.',
      'The limitations are a draft in the brief’s fallback wording. The Psychology expert owns them.',
    ],
  },
}
