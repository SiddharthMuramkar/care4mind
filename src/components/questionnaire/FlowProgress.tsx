'use client'

import { Progress } from '@base-ui/react/progress'
import { memo } from 'react'

import { progressOf, progressText, type FlowState } from '@/lib/questionnaire/flow'

import styles from './Flow.module.css'

interface TallyProps {
  parts: FlowState['parts']
  answers: FlowState['answers']
  /** The part on screen, from 1, or null on the review. */
  current: number | null
}

/**
 * The tally: one short rule per statement, in a group per part, each inked in as its statement is
 * answered (D21). Decoration: the words beside it say the same. Every group's width is set by
 * its count, so the box is the same from the first answer to the last.
 */
const Tally = memo(function Tally({ parts, answers, current }: TallyProps) {
  return (
    <span
      className={styles.tally}
      style={{ gridTemplateColumns: parts.map((ids) => `${ids.length}fr`).join(' ') }}
      aria-hidden="true"
    >
      {parts.map((ids, index) => (
        <span
          key={ids[0] ?? index}
          className={styles.group}
          data-current={index + 1 === current || undefined}
        >
          {ids.map((id) => (
            <span key={id} className={styles.rule} data-inked={id in answers || undefined} />
          ))}
        </span>
      ))}
    </span>
  )
})

/**
 * How far the visitor has come: "Part 2 of 4 · 14 of 45 answered" inside a progress bar, which
 * gives the same words as its value text. Not a live region: the words change with each answer
 * but are read only when the visitor comes to them.
 */
export function FlowProgress({ state }: { state: FlowState }) {
  const progress = progressOf(state)
  const text = progressText(progress)
  return (
    <Progress.Root
      className={styles.progress}
      value={progress.answered}
      max={progress.total}
      getAriaValueText={() => text}
    >
      <Progress.Label className={styles.visuallyHidden}>Your progress</Progress.Label>
      <Tally parts={state.parts} answers={state.answers} current={progress.part} />
      <Progress.Value className={styles.progressText}>{() => text}</Progress.Value>
    </Progress.Root>
  )
}
