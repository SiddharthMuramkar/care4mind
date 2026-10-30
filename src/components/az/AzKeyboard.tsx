'use client'

import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import { Toolbar } from '@base-ui/react/toolbar'

import { cx } from '@/lib/cx'

import styles from './AzIndex.module.css'
import type { ChipsProps, KeyboardParts, RailProps } from './types'

/** The rail as a Base UI Toolbar: one Tab stop, the arrow keys moving between its letters. */
function Rail({ letters, showing }: RailProps) {
  return (
    <Toolbar.Root aria-label="Jump to a letter" className={styles.rail}>
      {letters.map(({ letter, id, filled }) =>
        filled && (showing?.has(id) ?? true) ? (
          <Toolbar.Link key={id} href={`#${id}`} className={styles.letter} data-rail={id}>
            {letter}
          </Toolbar.Link>
        ) : (
          <span key={id} className={cx(styles.letter, styles.blank)}>
            {letter}
          </span>
        ),
      )}
    </Toolbar.Root>
  )
}

/** The chips as one Base UI ToggleGroup: one Tab stop, the arrow keys moving between chips. */
function Chips({ groups, pressed, onPress }: ChipsProps) {
  return (
    <ToggleGroup
      multiple
      value={[...pressed]}
      onValueChange={onPress}
      aria-label="Filter the entries"
      className={styles.chips}
    >
      {groups.map(({ group, label, chips }) => (
        <div
          key={group}
          role="group"
          aria-labelledby={`chips-${group}`}
          className={styles.chipGroup}
          // On a phone each group scrolls sideways: no Tab stop of its own, its chips have them.
          tabIndex={-1}
        >
          <span id={`chips-${group}`} className={styles.groupLabel}>
            {label}
          </span>
          {chips.map(({ value, label: name, lang }) => {
            const chip = `${group}:${value}`
            return (
              <Toggle key={chip} value={chip} className={styles.chip} data-chip={chip} data-ink>
                <span {...(lang ? { lang } : {})}>{name}</span>
              </Toggle>
            )
          })}
        </div>
      ))}
    </ToggleGroup>
  )
}

export const parts: KeyboardParts = { Rail, Chips }
