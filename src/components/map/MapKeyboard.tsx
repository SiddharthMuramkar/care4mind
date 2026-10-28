'use client'

import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'

import { KIND_WORDS, KINDS, type ConnectionKind } from './kinds'
import { LineSwatch } from './LineSwatch'
import type { ButtonsProps, KeyboardParts } from './MapFilters'
import styles from './MapFilters.module.css'

const isKind = (value: string | undefined): value is ConnectionKind =>
  KINDS.some((kind) => kind === value)

/**
 * The filters as two Base UI ToggleGroups: one Tab stop each, the arrow keys moving between the
 * buttons. Lines takes one kind at a time (pressing it again shows every kind); Topics takes any.
 */
function Buttons({ topics, selection, onChange }: ButtonsProps) {
  return (
    <>
      <ToggleGroup
        value={selection.kind ? [selection.kind] : []}
        onValueChange={(value) => {
          const kind = value.find(isKind) ?? null
          onChange({ ...selection, kind })
        }}
        aria-labelledby="map-kinds"
        className={styles.group}
      >
        <span id="map-kinds" className={styles.groupLabel}>
          Lines
        </span>
        {KINDS.map((kind) => (
          <Toggle
            key={kind}
            value={kind}
            className={styles.chip}
            data-chip={`kind:${kind}`}
            data-ink
          >
            <LineSwatch kind={kind} className={styles.swatch} />
            {KIND_WORDS[kind].button}
          </Toggle>
        ))}
      </ToggleGroup>
      <ToggleGroup
        multiple
        value={[...selection.topic]}
        onValueChange={(value) =>
          onChange({
            ...selection,
            topic: topics.map(({ slug }) => slug).filter((slug) => value.includes(slug)),
          })
        }
        aria-labelledby="map-topics"
        className={styles.group}
      >
        <span id="map-topics" className={styles.groupLabel}>
          Topics
        </span>
        {topics.map(({ slug, name }) => (
          <Toggle
            key={slug}
            value={slug}
            className={styles.chip}
            data-chip={`topic:${slug}`}
            data-topic={slug}
            data-ink
          >
            {name}
          </Toggle>
        ))}
      </ToggleGroup>
    </>
  )
}

export const parts: KeyboardParts = { Buttons }
