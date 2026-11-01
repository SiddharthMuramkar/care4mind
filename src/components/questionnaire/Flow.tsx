'use client'

import type { Route } from 'next'
import Link from 'next/link'
import {
  addTransitionType,
  lazy,
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  ViewTransition,
  type MouseEvent,
  type ReactNode,
} from 'react'

import { cta } from '@/components/cta'
import { Fleuron } from '@/components/ornaments'
import { turnBack } from '@/components/page-turn'
import type { QuestionnaireFormView } from '@/content'
import {
  addressOf,
  entryAt,
  flowReducer,
  partOf,
  placeOf,
  startFlow,
  stepFromAddress,
  unsaved,
  type FlowAction,
  type FlowState,
  type StepId,
} from './flow-state'

import styles from './Flow.module.css'
import { FlowProgress } from './FlowProgress'
import { Statement, statementId } from './Statement'

const loadRetakeDialog = () => import('./RetakeDialog')
const RetakeDialog = lazy(() =>
  loadRetakeDialog().then(({ RetakeDialog }) => ({ default: RetakeDialog })),
)

/** Moving on turns the page forward, Back turns it back (globals.css); others swap at once. */
const TURN = { 'turn-forward': 'turn-forward', 'turn-back': 'turn-back', default: 'none' }

const STEP_TITLE = 'flow-step-title'
const SUMMARY = 'flow-summary'

/** Where focus goes once a press has changed the flow. */
type Focus = { to: 'step' } | { to: 'summary' } | { to: 'statement'; item: string }

type Form = QuestionnaireFormView
type Part = Form['parts'][number]

interface Props {
  form: Form
  /** Each part's instructions, set on the server. */
  instructions: readonly ReactNode[]
  /** The Questionnaire's own page: its purpose and limitations. */
  intro: string
  /** Set on the server for the end screen: its limitations ... */
  limits: ReactNode
  /** ... and, after the answers, its source and related Concepts. */
  sources: ReactNode
}

/** Bring a statement into view and focus its chosen option, or its first. */
function focusStatement(item: string, behavior?: ScrollBehavior) {
  const statement = document.getElementById(statementId(item))
  if (!statement) return
  statement.scrollIntoView({ block: 'center', behavior })
  const option =
    statement.querySelector<HTMLInputElement>('input:checked') ??
    statement.querySelector<HTMLInputElement>('input')
  option?.focus({ preventScroll: true })
}

/** Whether this page was loaded by a browser Back; the Navigation API alone can tell. */
function arrivedByBack() {
  const activation = window.navigation?.activation
  if (activation?.navigationType !== 'traverse' || !activation.from) return false
  return activation.from.index > activation.entry.index
}

/** A plain press of a link, which the flow answers itself; others open the link as usual. */
const plainPress = (
  event: Pick<MouseEvent, 'button' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>,
) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

/**
 * Taking a Questionnaire, one part per screen, then a review and the end screen (C4). Every
 * answer lives in this component's reducer and nowhere else (D16): not in storage, cookies,
 * the address or any request. The address names only the step, so browser Back and Forward move
 * between parts; a reload starts again at part 1.
 */
export function Flow({ form, instructions, intro, limits, sources }: Props) {
  const [state, dispatch] = useReducer(flowReducer, form, startFlow)
  const [retaking, setRetaking] = useState(false)
  const [retakeAsked, setRetakeAsked] = useState(false)
  const focus = useRef<Focus | null>(null)
  /** This entry's place among the flow's history entries, so a traversal tells Back from Forward. */
  const place = useRef(0)

  /** Run a press: note the new step in history, and turn the page if the step changes. */
  function press(action: FlowAction, then: Focus | null, turn?: 'turn-forward' | 'turn-back') {
    const next = flowReducer(state, action)
    const moves = next.step !== state.step
    focus.current = next.refusals > state.refusals ? { to: 'summary' } : then
    if (moves) {
      place.current += 1
      window.history.pushState(entryAt(place.current), '', addressOf(next.step))
    }
    if (moves && turn) {
      startTransition(() => {
        addTransitionType(turn)
        dispatch(action)
      })
    } else {
      dispatch(action)
    }
  }

  const answer = useCallback(
    (item: string, option: string) => dispatch({ type: 'answer', item, option }),
    [],
  )

  // After a press, focus the new step's heading, the error summary or a statement.
  useLayoutEffect(() => {
    const target = focus.current
    focus.current = null
    if (!target) return
    if (target.to === 'statement') return focusStatement(target.item, 'instant')
    // A new step is a new page: it starts at its top at once, rather than gliding there.
    const element = document.getElementById(target.to === 'step' ? STEP_TITLE : SUMMARY)
    element?.scrollIntoView({ block: 'start', behavior: 'instant' })
    element?.focus({ preventScroll: true })
  }, [state.step, state.refusals])

  // Browser Back and Forward: go to the step the address names, or the furthest one open.
  const onPopState = useEffectEvent(() => {
    const entry = placeOf(window.history.state)
    // Not the flow's entry: Back has left it, for the intro or another page.
    if (entry === null) return
    const back = entry < place.current
    place.current = entry
    const wanted = stepFromAddress(window.location.search)
    const next = flowReducer(state, { type: 'go', step: wanted })
    // A Retake empties the steps it leaves; Back passes over them rather than doing nothing.
    if (back && next.step === state.step) return window.history.back()
    if (next.step !== wanted) {
      window.history.replaceState(entryAt(entry), '', addressOf(next.step))
    }
    if (next.step !== state.step) focus.current = { to: 'step' }
    dispatch({ type: 'go', step: wanted })
  })

  useEffect(() => {
    const listener = () => onPopState()
    window.addEventListener('popstate', listener)
    // Nothing is in memory on arrival, so an address naming a later step starts at part 1.
    const later = stepFromAddress(window.location.search) !== 'part-1'
    place.current = placeOf(window.history.state) ?? 0
    // Next patches history only after this effect, so its own state is kept by hand.
    const entry = { ...window.history.state, ...entryAt(place.current) }
    window.history.replaceState(entry, '', later ? addressOf('part-1') : undefined)
    // Back onto an entry a reload left behind shows part 1 again, as the page it left did.
    if (place.current > 0 && arrivedByBack()) window.history.back()
    return () => window.removeEventListener('popstate', listener)
  }, [])

  // Leaving with answers given and the end screen not reached asks first: on unload, and on a
  // plain press of a link to another page here. Browser Back from part 1 is a client-side
  // traversal that can't be cancelled, so it leaves without asking.
  const dirty = unsaved(state)
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    const ask = (event: globalThis.MouseEvent) => {
      if (event.defaultPrevented || !plainPress(event)) return
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!(link instanceof HTMLAnchorElement) || link.target || link.hasAttribute('download'))
        return
      // Other origins unload the document, which beforeunload asks about; links to this page
      // are the flow's own (Change, the error summary).
      const to = new URL(link.href)
      if (to.origin !== window.location.origin || to.pathname === window.location.pathname) return
      if (!window.confirm('Leave the Questionnaire? Your answers will be lost.')) {
        event.preventDefault()
      }
    }
    window.addEventListener('beforeunload', warn)
    // Capture, so the question comes before Next's Link reads defaultPrevented.
    document.addEventListener('click', ask, true)
    return () => {
      window.removeEventListener('beforeunload', warn)
      document.removeEventListener('click', ask, true)
    }
  }, [dirty])

  const part = partOf(state.step)
  const step = (
    <ViewTransition key={state.step} enter={TURN} exit={TURN} default="none">
      <div className={styles.step}>
        {part !== null ? (
          <PartStep
            form={form}
            index={part}
            instructions={instructions[part - 1]}
            state={state}
            intro={intro}
            onAnswer={answer}
            onNext={() => press({ type: 'next' }, { to: 'step' }, 'turn-forward')}
            onBack={() => press({ type: 'back' }, { to: 'step' }, 'turn-back')}
          />
        ) : state.step === 'review' ? (
          <ReviewStep
            form={form}
            state={state}
            onChange={(step, item) =>
              press({ type: 'go', step }, { to: 'statement', item }, 'turn-back')
            }
            onBack={() => press({ type: 'back' }, { to: 'step' }, 'turn-back')}
            onFinish={() => press({ type: 'next' }, { to: 'step' })}
          />
        ) : (
          <EndStep
            form={form}
            state={state}
            limits={limits}
            sources={sources}
            onRetake={() => {
              setRetakeAsked(true)
              setRetaking(true)
            }}
          />
        )}
      </div>
    </ViewTransition>
  )

  return (
    <div className={styles.flow}>
      {state.step !== 'end' ? <FlowProgress state={state} /> : null}
      {step}
      {retakeAsked ? (
        <Suspense fallback={null}>
          <RetakeDialog
            open={retaking}
            onOpenChange={setRetaking}
            // The dialog gives focus to part 1's heading as it closes.
            onConfirm={() => press({ type: 'retake' }, null)}
            afterConfirm={() => document.getElementById(STEP_TITLE)}
          />
        </Suspense>
      ) : null}
    </div>
  )
}

interface PartProps {
  form: Form
  index: number
  instructions: ReactNode
  state: FlowState
  intro: string
  onAnswer: (item: string, option: string) => void
  onNext: () => void
  onBack: () => void
}

/** One part: its instructions, then its statements, then Back and Next. */
function PartStep({
  form,
  index,
  instructions,
  state,
  intro,
  onAnswer,
  onNext,
  onBack,
}: PartProps) {
  const part = form.parts[index - 1]
  if (!part) return null
  const before = form.parts.slice(0, index - 1).reduce((sum, { items }) => sum + items.length, 0)
  return (
    <section className={styles.part} aria-labelledby={STEP_TITLE}>
      {state.missing.length > 0 ? <ErrorSummary part={part} missing={state.missing} /> : null}
      <header className={styles.stepHead}>
        <p className={styles.kicker}>Part {index}</p>
        <h2 id={STEP_TITLE} className={styles.stepTitle} tabIndex={-1}>
          {part.title}
        </h2>
        <p className={styles.instructions}>{instructions}</p>
      </header>
      <div className={styles.statements}>
        {part.items.map((item, position) => (
          <Statement
            key={item.id}
            item={item}
            number={before + position + 1}
            chosen={state.answers[item.id]}
            invalid={state.missing.includes(item.id)}
            onAnswer={onAnswer}
          />
        ))}
      </div>
      <div className={styles.controls}>
        {index === 1 ? (
          // The intro's address comes from hrefFor() on the server.
          <Link href={intro as Route} className={cta.secondary} transitionTypes={turnBack} data-ink>
            Back to its purpose and limits
          </Link>
        ) : (
          <button type="button" className={cta.secondary} onClick={onBack} data-ink>
            Back
          </button>
        )}
        <button type="button" className={cta.primary} onClick={onNext} data-ink>
          Next
        </button>
      </div>
    </section>
  )
}

/** Next refused: each statement left, linked, with focus here so it is read first. */
function ErrorSummary({ part, missing }: { part: Part; missing: readonly string[] }) {
  const left = part.items.filter(({ id }) => missing.includes(id))
  return (
    <section
      id={SUMMARY}
      className={styles.summary}
      tabIndex={-1}
      aria-labelledby={`${SUMMARY}-title`}
    >
      <h2 id={`${SUMMARY}-title`} className={styles.summaryTitle}>
        {left.length === 1 ? 'One statement has' : `${left.length} statements have`} no answer yet
      </h2>
      <p>Answer {left.length === 1 ? 'it' : 'each one'} to go on. Every answer you gave is kept.</p>
      <ul className={styles.summaryList}>
        {left.map((item) => (
          <li key={item.id}>
            <a
              href={`#${statementId(item.id)}`}
              onClick={(event) => {
                event.preventDefault()
                focusStatement(item.id)
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

interface ReviewProps {
  form: Form
  state: FlowState
  onChange: (step: StepId, item: string) => void
  onBack: () => void
  onFinish: () => void
}

/** Every statement with its answer, by part, each with a way back to change it. */
function ReviewStep({ form, state, onChange, onBack, onFinish }: ReviewProps) {
  return (
    <section className={styles.review} aria-labelledby={STEP_TITLE}>
      <header className={styles.stepHead}>
        <p className={styles.kicker}>Before you finish</p>
        <h2 id={STEP_TITLE} className={styles.stepTitle} tabIndex={-1}>
          Review your answers
        </h2>
        <p>Change takes you back to a statement’s part, with every other answer kept.</p>
      </header>
      <Answers form={form} answers={state.answers} level={3} onChange={onChange} />
      <div className={styles.controls}>
        <button type="button" className={cta.secondary} onClick={onBack} data-ink>
          Back
        </button>
        <button type="button" className={cta.primary} onClick={onFinish} data-ink>
          Finish
        </button>
      </div>
    </section>
  )
}

interface AnswersProps {
  form: Form
  answers: FlowState['answers']
  level: 3 | 4
  onChange?: (step: StepId, item: string) => void
}

/** The answers, set like a book's contents: each statement, a dotted leader, its answer. */
function Answers({ form, answers, level, onChange }: AnswersProps) {
  const Heading = level === 3 ? 'h3' : 'h4'
  return form.parts.map((part, index) => {
    const step: StepId = `part-${index + 1}`
    return (
      <section key={part.id} className={styles.answersPart} aria-labelledby={`answers-${part.id}`}>
        <Heading id={`answers-${part.id}`} className={styles.answersTitle}>
          {part.title}
        </Heading>
        <dl className={styles.answers}>
          {part.items.map((item) => (
            <div key={item.id} className={styles.row}>
              <dt className={styles.rowStatement}>
                <span>{item.text}</span>
                <span className={styles.leader} aria-hidden="true" />
              </dt>
              <dd className={styles.answer}>{answers[item.id] ?? 'No answer'}</dd>
              {onChange ? (
                <dd className={styles.change}>
                  <a
                    href={addressOf(step)}
                    onClick={(event) => {
                      if (!plainPress(event)) return
                      event.preventDefault()
                      onChange(step, item.id)
                    }}
                  >
                    Change
                    <span className="sr-only"> your answer to “{item.text}”</span>
                  </a>
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      </section>
    )
  })
}

interface EndProps {
  form: Form
  state: FlowState
  limits: ReactNode
  sources: ReactNode
  onRetake: () => void
}

/**
 * The end screen: a placeholder where the result will be, set as a plate still to be printed.
 * No number, percentage or band: the scoring rules aren't confirmed. Its lotus rests.
 */
function EndStep({ form, state, limits, sources, onRetake }: EndProps) {
  useEffect(() => {
    void loadRetakeDialog()
  }, [])
  return (
    <section className={styles.end} aria-labelledby={STEP_TITLE}>
      <header className={styles.stepHead}>
        <p className={styles.kicker}>Every part answered</p>
        <h2 id={STEP_TITLE} className={styles.stepTitle} tabIndex={-1}>
          Your result
        </h2>
      </header>
      <figure className={styles.plate}>
        <figcaption className={styles.plateLabel}>Placeholder</figcaption>
        <Fleuron className={styles.plateOrnament} />
        <p className={styles.plateText}>
          The {form.title}’s scoring rules are with the Psychology expert; your result appears here
          once they are confirmed.
        </p>
      </figure>
      {limits}
      <section className={styles.yourAnswers} aria-labelledby="your-answers">
        <h3 id="your-answers" className={styles.sectionTitle}>
          Your answers
        </h3>
        <Answers form={form} answers={state.answers} level={4} />
      </section>
      <div className={styles.controls}>
        <button type="button" className={cta.secondary} onClick={() => window.print()}>
          Print your answers
        </button>
        <button type="button" className={cta.secondary} onClick={onRetake} data-ink>
          Retake
        </button>
      </div>
      {sources}
    </section>
  )
}
