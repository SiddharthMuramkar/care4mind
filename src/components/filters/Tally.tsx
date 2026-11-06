import type { RefObject } from 'react'

import { cx } from '@/lib/cx'

import styles from './filters.module.css'

/** The clear button unmounts with the filter, which would drop focus on the page. */
function focusBeforeClear(root: ParentNode | null) {
  const next =
    root?.querySelector<HTMLElement>('[data-chip]') ??
    root?.querySelector<HTMLElement>('[aria-live="polite"]')
  next?.focus()
}

interface Props {
  /** What the filter leaves showing, announced politely as it changes. */
  count: string
  /** Clears the filter; without it there is nothing to clear and no button. */
  onClear?: () => void
  /** The island round the chips, where focus goes as Clear filters unmounts. */
  controls: RefObject<HTMLElement | null>
  className?: string | undefined
  clearClassName?: string | undefined
}

/** A filter's count, and its Clear filters button while a filter is chosen. */
export function Tally({ count, onClear, controls, className, clearClassName }: Props) {
  return (
    <div className={className}>
      <p tabIndex={-1} className={styles.count} aria-live="polite" aria-atomic="true">
        {count}
      </p>
      {onClear ? (
        <button
          type="button"
          className={cx(styles.clear, clearClassName)}
          data-ink
          onClick={() => {
            focusBeforeClear(controls.current)
            onClear()
          }}
        >
          Clear filters
        </button>
      ) : null}
    </div>
  )
}
