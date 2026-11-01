import type { ContentKind } from './kinds'

/** The fields that hold another record's id, or a link's target, wherever they appear. */
export const LINK_FIELDS: readonly string[] = [
  'topics',
  'references',
  'passage',
  'translation',
  'questionnaire',
  'concepts',
  'candidateSource',
  'concept',
  'work',
  'topic',
  'reference',
  'target',
  'responseSet',
]

/** Fields that hold another record's id in one kind of record only. */
export const LINK_FIELDS_IN: Partial<Record<ContentKind, readonly string[]>> = {
  questionnaire: ['source'],
}
