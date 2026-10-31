'use client'

import {
  type ComponentType,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { whenIdle } from '@/components/browser'

import {
  countText,
  NOTHING,
  readSelection,
  type Selection,
  shows,
  stands,
  writeSelection,
} from './filter'
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

// The address is the filters' one source: a press pushes a new one, Back restores the last.
const listeners = new Set<() => void>()
function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}
const search = () => window.location.search
const noSearch = () => ''

/** Move to a new address, keeping its fragment (#plate on a phone), and let the filters read it. */
function go(selection: Selection) {
  const { pathname, hash } = window.location
  window.history.pushState(null, '', `${pathname}${writeSelection(selection)}${hash}`)
  for (const listener of listeners) listener()
}

/** The map's elements a filter touches, as the server rendered them. */
const map = () => (typeof document === 'undefined' ? null : document.querySelector('[data-map]'))
const facts = (element: HTMLElement | SVGElement) => ({
  kind: element.dataset.kind as ConnectionKind,
  topics: (element.dataset.topics ?? '').split(' '),
})

/** How many curves a selection leaves showing. */
function countShown(selection: Selection) {
  const root = map()
  if (!root) return null
  return [...root.querySelectorAll<SVGPathElement>('path[data-c]')].filter((curve) =>
    shows(facts(curve), selection),
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
  for (const curve of root.querySelectorAll<SVGPathElement>('path[data-c]')) {
    const on = shows(facts(curve), selection)
    toggle(curve, 'data-off', !on)
    if (!on) continue
    const [a = '', b = ''] = (curve.dataset.ends ?? '').split(' ')
    join(a, b)
    join(b, a)
  }
  for (const row of root.querySelectorAll<HTMLElement>('li[data-c]'))
    toggle(row, 'hidden', !shows(facts(row), selection))
  for (const part of root.querySelectorAll<HTMLElement>('[data-kind-section]'))
    toggle(part, 'hidden', !part.querySelector('li[data-c]:not([hidden])'))
  for (const point of root.querySelectorAll<HTMLElement>('[data-p]')) {
    const neighbours = [...(near.get(point.dataset.p ?? '') ?? [])].join(' ')
    if (point.dataset.near !== neighbours) point.dataset.near = neighbours
    toggle(point, 'data-faint', !stands((point.dataset.topics ?? '').split(' '), selection))
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
              className={styles.chip}
              aria-pressed={on}
              data-chip={`kind:${kind}`}
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
              className={styles.chip}
              aria-pressed={on}
              data-chip={`topic:${slug}`}
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
  const address = useSyncExternalStore(subscribe, search, noSearch)
  const selection = useMemo(() => readSelection(address, known), [address, known])
  const shown = useMemo(() => countShown(selection) ?? total, [selection, total])
  const [parts, setParts] = useState<KeyboardParts>()
  const controls = useRef<HTMLDivElement>(null)
  const handoff = useRef<string | undefined>(undefined)
  const filtered = useRef(false)

  // A press under way when Base UI arrives finishes on the plain button first: swapping the
  // button between its pointerdown and its click would lose the press.
  const pressing = useRef(false)
  const waiting = useRef<(() => void) | undefined>(undefined)
  const release = () => {
    setTimeout(() => {
      pressing.current = false
      waiting.current?.()
      waiting.current = undefined
    })
  }
  const hold = () => {
    pressing.current = true
    setTimeout(release, 1000)
  }

  const upgrade = useCallback(() => {
    void loadKeyboard().then((loaded) => {
      const swap = () => {
        const focused = document.activeElement
        if (focused instanceof HTMLElement && controls.current?.contains(focused))
          handoff.current = focused.dataset.chip
        setParts(() => loaded)
      }
      if (pressing.current) waiting.current = swap
      else swap()
    })
  }, [])

  useEffect(() => whenIdle(upgrade), [upgrade])

  useLayoutEffect(() => {
    // The server's page is the unfiltered map: nothing to do until a filter is chosen.
    if (!filtered.current && selection.kind === null && selection.topic.length === 0) return
    filtered.current = true
    applySelection(selection)
  }, [selection])

  useEffect(() => {
    const key = handoff.current
    if (!parts || !key) return
    handoff.current = undefined
    controls.current?.querySelector<HTMLElement>(`[data-chip="${key}"]`)?.focus()
  }, [parts])

  const Buttons = parts?.Buttons ?? PlainButtons
  const empty = selection.kind === null && selection.topic.length === 0

  return (
    <div
      ref={controls}
      className={styles.filters}
      onPointerEnter={parts ? undefined : upgrade}
      onFocus={parts ? undefined : upgrade}
      onPointerDown={parts ? undefined : hold}
      onKeyDown={parts ? undefined : ({ key }) => (key === ' ' || key === 'Enter') && hold()}
      onPointerUp={parts ? undefined : release}
      onPointerCancel={parts ? undefined : release}
      onKeyUp={parts ? undefined : release}
    >
      <div className={styles.groups}>
        <Buttons topics={topics} selection={selection} onChange={go} />
      </div>
      <div className={styles.tally}>
        <p className={styles.count} aria-live="polite" aria-atomic="true">
          {countText(shown, total)}
        </p>
        {empty ? null : (
          <button type="button" className={styles.clear} data-ink onClick={() => go(NOTHING)}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
