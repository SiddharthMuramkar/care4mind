import type { Inline, Provenance, ReviewStatus, Slug } from './common'

/** Live and preview can be taken (preview only where its flag is on); the others can't (D16). */
export type QuestionnaireStatus = 'live' | 'preview' | 'coming-soon' | 'coming-later'

/** An instrument's questions, word for word, in the order its source gives them. */
export interface QuestionnaireForm {
  /** Each option list, in the source's order, by name. */
  responseSets: Readonly<Record<string, readonly string[]>>
  parts: readonly {
    id: Slug
    title: string
    instructions: Inline
    items: readonly {
      id: string
      /** Verbatim, never edited: an oddity is flagged, not fixed. */
      text: string
      /** The name of one of `responseSets`. */
      responseSet: string
      /** The source lists this item's options in reverse. Display order only: not scoring. */
      reversed?: true
    }[]
  }[]
}

/**
 * A Questionnaire (GLOSSARY). No record holds an answer key, points, weights, bands, cut-offs or
 * result text: score interpretation is held back until the Psychology expert approves documented
 * rules (FR-05).
 */
export interface QuestionnaireRecord {
  kind: 'questionnaire'
  slug: Slug
  title: string
  /** The page title as published. */
  sourceTitle: string
  status: QuestionnaireStatus
  summary?: Inline
  purpose?: readonly Inline[]
  format?: readonly Inline[]
  concepts: readonly Slug[]
  /** A Reference id: the published source of its items. */
  source?: string
  /** A Reference id: a published source the items may come from (research ticket 11). */
  candidateSource?: string
  limitations?: {
    items: readonly Inline[]
    status: 'draft-pending-psychology-expert' | 'approved'
  }
  form?: QuestionnaireForm
  /** The only allowed value until planning tickets 26 and 28 supply rules. */
  scoring: { status: 'pending'; reason: string }
  /** Each score section left out, described and located, never quoted. */
  heldBack: readonly { what: string; where: string }[]
  rights?: { status: 'permission-needed' | 'cleared'; holder: string; note: string }
  reviewStatus: ReviewStatus
  provenance: Provenance
}

/** Type-checks a Questionnaire record file; returns it unchanged. */
export function defineQuestionnaire(record: QuestionnaireRecord): QuestionnaireRecord {
  return record
}
