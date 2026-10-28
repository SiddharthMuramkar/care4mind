'use client'

import { memo } from 'react'

import styles from './Flow.module.css'

interface Props {
  item: { id: string; text: string; options: readonly string[] }
  /** Its place among all the statements, from 1: a rubricated number in the margin. */
  number: number
  chosen: string | undefined
  /** Next found it unanswered. */
  invalid: boolean
  onAnswer: (item: string, option: string) => void
}

/** The element id of a statement, which the error summary and Change links lead to. */
export const statementId = (item: string) => `item-${item}`

/**
 * One statement: a native fieldset named by the statement exactly as stored, with its options
 * as native radio buttons in the source's order. Choosing one only records it: focus stays and
 * the part doesn't change (WCAG 3.2.2); the arrow keys move between options as they always do.
 */
export const Statement = memo(function Statement({
  item,
  number,
  chosen,
  invalid,
  onAnswer,
}: Props) {
  const id = statementId(item.id)
  return (
    <fieldset
      id={id}
      role="radiogroup"
      className={styles.statement}
      aria-labelledby={`${id}-text`}
      aria-required="true"
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
    >
      <legend id={`${id}-text`} className={styles.legend}>
        {item.text}
      </legend>
      <span className={styles.number} aria-hidden="true">
        {number}
      </span>
      {invalid ? (
        <p id={`${id}-error`} className={styles.error}>
          Choose an answer to this statement.
        </p>
      ) : null}
      <div className={styles.options}>
        {item.options.map((option) => (
          <label key={option} className={styles.option}>
            <input
              type="radio"
              className={styles.radio}
              name={id}
              value={option}
              checked={chosen === option}
              onChange={() => onAnswer(item.id, option)}
            />
            <span className={styles.mark} aria-hidden="true" />
            <span className={styles.optionText}>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
})
