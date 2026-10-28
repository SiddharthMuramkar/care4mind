import type { QuestionnaireFormView } from '@/content'

/**
 * A Questionnaire's result. Its scoring rules are with the Psychology expert, so every complete
 * answer set is pending: this code holds no key, no points and no bands (D12, D16). Once the
 * rules are confirmed, a scored result joins this type and the end screen shows it.
 */
export type Score = { status: 'pending' } | { status: 'incomplete' }

export function scoreQuestionnaire(
  form: Pick<QuestionnaireFormView, 'parts'>,
  answers: Readonly<Record<string, string>>,
): Score {
  const complete = form.parts.every(({ items }) => items.every(({ id }) => id in answers))
  return complete ? { status: 'pending' } : { status: 'incomplete' }
}
