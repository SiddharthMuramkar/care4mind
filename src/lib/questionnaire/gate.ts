import type { Route } from 'next'

import { features, type Features } from '@/config/features'
import {
  hrefFor,
  type QuestionnaireCard,
  type QuestionnaireFormView,
  type QuestionnaireStatus,
} from '@/content'

const WORDS: Record<QuestionnaireStatus, string> = {
  live: 'Open',
  preview: 'Preview',
  'coming-soon': 'Coming soon',
  'coming-later': 'Coming later',
}

/**
 * A Questionnaire's status in words, never by colour alone (WCAG 1.4.1). A preview can be taken
 * only where its flag is on; elsewhere it is coming soon (D16).
 */
export function statusWords(status: QuestionnaireStatus, flags: Features = features): string {
  return status === 'preview' && !flags.questionnairePreview ? WORDS['coming-soon'] : WORDS[status]
}

/** The intro's Start: a link to the flow, or disabled where the Questionnaire can't be taken. */
export type Start = { open: true; href: Route } | { open: false }

/**
 * Where Start leads. The content module offers a form only for a Questionnaire that can be taken
 * in this build (live, or a preview with its flag on), and only then does the flow's route exist.
 */
export function startOf(
  questionnaire: Pick<QuestionnaireCard, 'slug' | 'status'>,
  form: QuestionnaireFormView | null,
): Start {
  if (!form) return { open: false }
  const { slug, status } = questionnaire
  return { open: true, href: hrefFor({ kind: 'questionnaire', id: slug, status, flow: true }) }
}
