import type { QuestionnaireFormView } from '@/content'

/**
 * Taking a Questionnaire (front-end-site ticket 10): one part per screen, then a review, then the
 * end screen. The whole state lives here, in memory only (D16): nothing is stored or sent, and
 * the address names only the step.
 */

/** A screen of the flow: a part (numbered from 1), the review or the end screen. */
export type StepId = `part-${number}` | 'review' | 'end'

export interface FlowState {
  /** Each part's statement ids, in order. */
  readonly parts: readonly (readonly string[])[]
  readonly step: StepId
  /** The option chosen for each statement answered, by statement id. */
  readonly answers: Readonly<Record<string, string>>
  /** The statements Next found unanswered on this part, in order; empty unless refused. */
  readonly missing: readonly string[]
  /** How many times Next has been refused, so each refusal can take focus again. */
  readonly refusals: number
}

export type FlowAction =
  | { type: 'answer'; item: string; option: string }
  | { type: 'next' }
  | { type: 'back' }
  /** Browser Back and Forward, and a Change link: to a step already open, or the first one not. */
  | { type: 'go'; step: StepId }
  | { type: 'retake' }

/** A flow at its first part, with nothing answered. */
export function startFlow(form: Pick<QuestionnaireFormView, 'parts'>): FlowState {
  return {
    parts: form.parts.map(({ items }) => items.map(({ id }) => id)),
    step: 'part-1',
    answers: {},
    missing: [],
    refusals: 0,
  }
}

/** The steps in order: every part, then review, then the end screen. */
function stepsOf(state: FlowState): StepId[] {
  return [...state.parts.map((_, i) => partStep(i + 1)), 'review', 'end']
}

const partStep = (part: number): StepId => `part-${part}`

/** The part a step shows (from 1), or null for review and the end screen. */
export function partOf(step: StepId): number | null {
  const match = /^part-([1-9]\d*)$/.exec(step)
  return match ? Number(match[1]) : null
}

const unanswered = (state: FlowState, part: number) =>
  (state.parts[part - 1] ?? []).filter((id) => !Object.hasOwn(state.answers, id))

/** The furthest step open now: the first part with a statement left, else the end screen. */
function furthest(state: FlowState): number {
  const part = state.parts.findIndex((_, i) => unanswered(state, i + 1).length > 0)
  return part === -1 ? state.parts.length + 1 : part
}

function moveTo(state: FlowState, step: StepId): FlowState {
  return { ...state, step, missing: [] }
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  const steps = stepsOf(state)
  const at = steps.indexOf(state.step)
  switch (action.type) {
    case 'answer': {
      if (!state.parts.some((ids) => ids.includes(action.item))) return state
      return {
        ...state,
        answers: { ...state.answers, [action.item]: action.option },
        missing: state.missing.filter((id) => id !== action.item),
      }
    }
    case 'next': {
      const part = partOf(state.step)
      const left = part === null ? [] : unanswered(state, part)
      if (left.length > 0) return { ...state, missing: left, refusals: state.refusals + 1 }
      return at < steps.length - 1 ? moveTo(state, steps[at + 1] ?? state.step) : state
    }
    case 'back':
      return moveTo(state, at > 0 ? (steps[at - 1] ?? state.step) : state.step)
    case 'go': {
      const wanted = steps.indexOf(action.step)
      const open = Math.min(wanted === -1 ? 0 : wanted, furthest(state))
      return moveTo(state, steps[open] ?? 'part-1')
    }
    case 'retake':
      return { parts: state.parts, step: 'part-1', answers: {}, missing: [], refusals: 0 }
  }
}

/** How far the flow has come, for the progress line and the tally. */
export interface Progress {
  /** The part on screen (from 1), or null for review and the end screen. */
  part: number | null
  parts: number
  answered: number
  total: number
}

export function progressOf(state: FlowState): Progress {
  const ids = state.parts.flat()
  return {
    part: partOf(state.step),
    parts: state.parts.length,
    answered: ids.filter((id) => Object.hasOwn(state.answers, id)).length,
    total: ids.length,
  }
}

/** "Part 2 of 4 · 14 of 45 answered", or "Review · 45 of 45 answered". */
export function progressText({ part, parts, answered, total }: Progress): string {
  const where = part === null ? 'Review' : `Part ${part} of ${parts}`
  return `${where} · ${answered} of ${total} answered`
}

/** The address of a step: its query string, naming the step and nothing else. */
export function addressOf(step: StepId): string {
  return `?step=${step}`
}

/** A history entry of the flow's own, numbered by its place among them. */
export const entryAt = (place: number) => ({ flowPlace: place })

/** The place of a flow entry; null for an entry the flow didn't make. */
export function placeOf(entry: unknown): number | null {
  if (typeof entry !== 'object' || entry === null || !('flowPlace' in entry)) return null
  return typeof entry.flowPlace === 'number' ? entry.flowPlace : null
}

/** The step an address names; part 1 when it names none. */
export function stepFromAddress(search: string): StepId {
  const step = new URLSearchParams(search).get('step')
  if (step === 'review' || step === 'end') return step
  return step !== null && partOf(step as StepId) !== null ? (step as StepId) : 'part-1'
}

/** Whether leaving now would lose answers: some are given and the end screen isn't reached. */
export function unsaved(state: FlowState): boolean {
  return state.step !== 'end' && Object.keys(state.answers).length > 0
}
