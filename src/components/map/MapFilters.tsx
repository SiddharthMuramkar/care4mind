'use client'

import { type ComponentType, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { filterStyles, Tally } from '@/components/filters'
import { pushAddress, useAddressQuery, useKeyboardParts } from '@/components/island'
import { cx } from '@/lib/cx'

import {
  countText,
  NOTHING,
  readSelection,
  type Selection,
  shows,
  stands,
  writeSelection,
} from './filter'
import { mapAttribute } from './attributes'
import { KIND_WORDS, KINDS, type ConnectionKind } from './kinds'
import { LineSwatch } from './LineSwatch'
import styles from './MapFilters.module.css'

export interface FilterTopic {
  slug: string
  name: string
}

export interface ButtonsProps {
  topics: readonly FilterTopic[]
  selection: Selection
  onChange: (selection: Selection) => void
}

/** The buttons with Base UI's keyboard handling: one Tab stop for each group, arrows between. */
export interface KeyboardParts {
  Buttons: ComponentType<ButtonsProps>
}

let keyboard: Promise<KeyboardParts> | undefined
const loadKeyboard = () => (keyboard ??= import('./MapKeyboard').then((module) => module.parts))

/** Move to a new address, keeping its fragment (#plate on a phone), and let the filters read it. */
function go(selection: Selection) {
  const { pathname, hash } = window.location
  pushAddress(`${pathname}${writeSelection(selection)}${hash}`)
}

/** The map's elements a filter touches, as the server rendered them. */
const map = () =>
  typeof document === 'undefined' ? null : document.querySelector(`[${mapAttribute.map}]`)
const facts = (element: HTMLElement | SVGElement) => ({
  kind: element.getAttribute(mapAttribute.kind) as ConnectionKind,
  topics: (element.getAttribute(mapAttribute.topics) ?? '').split(' '),
})

/** How many curves a selection leaves showing. */
function countShown(selection: Selection) {
  const root = map()
  if (!root) return null
  return [...root.querySelectorAll<SVGPathElement>(`path[${mapAttribute.connection}]`)].filter(
    (curve) => shows(facts(curve), selection),
  ).length
}

/**
 * Show what a selection leaves, touching only elements whose state changes: curves off the plate,
 * rows and empty parts out of the list, Concepts outside the chosen topics in a lighter ink. Each
 * Concept's neighbours become those it still has a curve to, so pointing at it lights only those.
 */
function applySelection(selection: Selection) {
  const root = map()
  if (!root) return
  const near = new Map<string, Set<string>>()
  const join = (from: string, to: string) => near.set(from, (near.get(from) ?? new Set()).add(to))
  const toggle = (element: Element, name: string, on: boolean) => {
    if (element.hasAttribute(name) !== on) element.toggleAttribute(name, on)
  }
  for (const curve of root.querySelectorAll<SVGPathElement>(`path[${mapAttribute.connection}]`)) {
    const on = shows(facts(curve), selection)
    toggle(curve, mapAttribute.off, !on)
    if (!on) continue
    const [a = '', b = ''] = (curve.getAttribute(mapAttribute.ends) ?? '').split(' ')
    join(a, b)
    join(b, a)
  }
  for (const row of root.querySelectorAll<HTMLElement>(`li[${mapAttribute.connection}]`))
    toggle(row, 'hidden', !shows(facts(row), selection))
  for (const part of root.querySelectorAll<HTMLElement>(`[${mapAttribute.kindSection}]`))
    toggle(part, 'hidden', !part.querySelector(`li[${mapAttribute.connection}]:not([hidden])`))
  for (const point of root.querySelectorAll<HTMLElement>(`[${mapAttribute.point}]`)) {
    const neighbours = [...(near.get(point.getAttribute(mapAttribute.point) ?? '') ?? [])].join(' ')
    if (point.getAttribute(mapAttribute.near) !== neighbours)
      point.setAttribute(mapAttribute.near, neighbours)
    toggle(
      point,
      mapAttribute.faint,
      !stands((point.getAttribute(mapAttribute.topics) ?? '').split(' '), selection),
    )
  }
}

/** The buttons before Base UI arrives: toggle buttons, so an early press already filters. */
function PlainButtons({ topics, selection, onChange }: ButtonsProps) {
  return (
    <>
      <div role="group" aria-labelledby="map-kinds" className={styles.group}>
        <span id="map-kinds" className={styles.groupLabel}>
          Lines
        </span>
        {KINDS.map((kind) => {
          const on = selection.kind === kind
          return (
            <button
              key={kind}
              type="button"
              className={cx(filterStyles.chip, styles.chip)}
              aria-pressed={on}
              {...{ [mapAttribute.chip]: `kind:${kind}` }}
              data-ink
              onClick={() => onChange({ ...selection, kind: on ? null : kind })}
            >
              <LineSwatch kind={kind} className={styles.swatch} />
              {KIND_WORDS[kind].button}
            </button>
          )
        })}
      </div>
      <div role="group" aria-labelledby="map-topics" className={styles.group}>
        <span id="map-topics" className={styles.groupLabel}>
          Topics
        </span>
        {topics.map(({ slug, name }) => {
          const on = selection.topic.includes(slug)
          return (
            <button
              key={slug}
              type="button"
              className={cx(filterStyles.chip, styles.chip)}
              aria-pressed={on}
              {...{ [mapAttribute.chip]: `topic:${slug}` }}
              data-topic={slug}
              data-ink
              onClick={() =>
                onChange({
                  ...selection,
                  topic: on
                    ? selection.topic.filter((other) => other !== slug)
                    : [...selection.topic, slug],
                })
              }
            >
              {name}
            </button>
          )
        })}
      </div>
    </>
  )
}

interface Props {
  topics: readonly FilterTopic[]
  /** How many connections the plate draws. */
  total: number
}

/**
 * The Concept map's filters, its one client island: one kind of line at a time and any topics,
 * kept in the address. A filter hides the curves and rows it leaves out, so the plate and the
 * list never re-render. Base UI's ToggleGroups load when the browser is idle or a pointer or focus
 * comes near; until then the buttons are plain toggle buttons. Without JavaScript they are hidden
 * and everything shows.
 */
export function MapFilters({ topics, total }: Props) {
  const known = useMemo(() => new Set(topics.map(({ slug }) => slug)), [topics])
  const address = useAddressQuery()
  const selection = useMemo(() => readSelection(address, known), [address, known])
  const [shown, setShown] = useState<number | null>(null)
  const { parts, controls, handlers } = useKeyboardParts(loadKeyboard)
  const filtered = useRef(false)

  useLayoutEffect(() => {
    // The server's page is the unfiltered map: nothing to do until a filter is chosen.
    // The plate is around this island, so a client mount can't count its curves during render.
    if (!filtered.current && selection.kind === null && selection.topic.length === 0) return
    filtered.current = true
    applySelection(selection)
    setShown(countShown(selection))
  }, [selection])

  const Buttons = parts?.Buttons ?? PlainButtons
  const empty = selection.kind === null && selection.topic.length === 0

  return (
    <div ref={controls} className={styles.filters} {...handlers}>
      <div className={styles.groups}>
        <Buttons topics={topics} selection={selection} onChange={go} />
      </div>
      <Tally
        count={countText(shown ?? total, total)}
        onClear={empty ? undefined : () => go(NOTHING)}
        controls={controls}
        className={styles.tally}
        clearClassName={styles.clear}
      />
    </div>
  )
}
