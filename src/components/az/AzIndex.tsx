'use client'

import {
  type ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { flushSync } from 'react-dom'

import { whenIdle } from '@/components/nav/current'
import { cx } from '@/lib/cx'

import styles from './AzIndex.module.css'
import {
  fromChips,
  GROUPS,
  isEmpty,
  readSelection,
  type Selection,
  shownEntries,
  toChips,
  writeSelection,
} from './filter'
import type { ChipGroup, ChipsProps, KeyboardParts, RailLetter, RailProps } from './types'

let keyboard: Promise<KeyboardParts> | undefined
const loadKeyboard = () => (keyboard ??= import('./AzKeyboard').then((module) => module.parts))

/** The list's id: the filters read which entries and letters are showing from it. */
const LIST = 'az-list'

/**
 * How many entries may fly to their new place as a filter changes: those on screen, at most 40.
 * Each named entry is captured on its own, so off-screen ones would cost time and show nothing.
 */
const NAMED = 40

/** Set on the page while its list reorders. */
const REORDERING = 'data-az-reorder'

// The address is the filter's one source: a chip press pushes a new one, Back restores the last.
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

/** Move to a new address, and let the filters read it at once. */
function go(selection: Selection) {
  window.history.pushState(null, '', `${window.location.pathname}${writeSelection(selection)}`)
  for (const listener of listeners) listener()
}

/** How many reorders are under way: the page stays out of their pictures until the last ends. */
let reordering = 0

/**
 * Change the filter, letting the first entries on screen glide to their new places (a view
 * transition), unless motion is reduced or the browser has no view transitions. Only the entries
 * are captured (`ALONE`): the chips, the count, the header and the rest of the page change in
 * place, which spares a slow phone two pictures of the whole screen.
 */
function reorder(from: Selection, to: Selection, change: () => void) {
  const list = document.getElementById(LIST)
  const still = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  if (!list || still || typeof document.startViewTransition !== 'function') return change()
  const root = document.documentElement
  reordering += 1
  root.setAttribute(REORDERING, '')
  const named: HTMLElement[] = []
  // Each entry is named by its place in the whole list, the same before and after.
  const places = new Map([...list.querySelectorAll('[data-entry]')].map((entry, at) => [entry, at]))
  const name = (selection: Selection) => {
    for (const entry of list.querySelectorAll<HTMLElement>(shownEntries(selection))) {
      if (named.length === NAMED) return
      const { top, bottom } = entry.getBoundingClientRect()
      if (bottom < 0) continue
      if (top > window.innerHeight) return
      entry.style.setProperty('view-transition-name', `az-${places.get(entry) ?? named.length}`)
      entry.style.setProperty('view-transition-class', 'az-entry')
      named.push(entry)
    }
  }
  const clear = () => {
    for (const entry of named.splice(0)) {
      entry.style.removeProperty('view-transition-name')
      entry.style.removeProperty('view-transition-class')
      if (entry.getAttribute('style') === '') entry.removeAttribute('style')
    }
  }
  name(from)
  const transition = document.startViewTransition(() => {
    change()
    clear()
    name(to)
  })
  void transition.finished.finally(() => {
    clear()
    reordering -= 1
    if (reordering === 0) root.removeAttribute(REORDERING)
  })
}

/**
 * Hide the entries, and the letters, a selection leaves out. Only the elements whose state
 * changes are touched, which keeps a press quick on a slow phone (a stylesheet would restyle
 * the whole page).
 */
function filterList(selection: Selection, query: string) {
  const list = document.getElementById(LIST)
  if (!list) return
  const shows = matcher(selection, query)
  const hide = (element: HTMLElement, hidden: boolean) => {
    if (element.hidden !== hidden) element.hidden = hidden
  }
  for (const entry of list.querySelectorAll<HTMLElement>('[data-entry]')) hide(entry, !shows(entry))
  for (const section of list.querySelectorAll<HTMLElement>('[data-letter]'))
    hide(section, ![...section.querySelectorAll('[data-entry]')].some(shows))
}

/** Words as a search compares them: without case or diacritics, so "manas" finds "Manas" and "mānas". */
const fold = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()

const folded = new WeakMap<Element, string>()
const wordsOf = (entry: Element) => {
  let words = folded.get(entry)
  if (words === undefined) folded.set(entry, (words = fold(entry.textContent ?? '')))
  return words
}

/** Whether an entry shows: it matches the chips, and holds the searched words. */
function matcher(selection: Selection, query: string) {
  const shown = shownEntries(selection)
  const words = fold(query)
  return (entry: Element) =>
    entry.matches(shown) && (words === '' || wordsOf(entry).includes(words))
}

/** Which entries and letters a selection and a search leave showing, read from the server-rendered list. */
function showingFor(selection: Selection, query: string) {
  const list = typeof document === 'undefined' ? null : document.getElementById(LIST)
  if ((isEmpty(selection) && fold(query) === '') || !list) return null
  const shows = matcher(selection, query)
  return {
    count: [...list.querySelectorAll('[data-entry]')].filter(shows).length,
    letters: new Set(
      [...list.querySelectorAll<HTMLElement>('[data-letter]')]
        .filter((section) => [...section.querySelectorAll('[data-entry]')].some(shows))
        .map(({ id }) => id),
    ),
  }
}

const entries = (count: number) => `${count} ${count === 1 ? 'entry' : 'entries'}`

// The reordering list's flights, set here as the island is the only thing that starts them.
const FLIGHTS = `::view-transition-group(.az-entry) { animation-duration: var(--duration-reorder); animation-timing-function: var(--ease-out); }`

// While the list reorders, nothing but its entries is captured: not the page itself, nor what
// names itself for page turns (the header and footer, by their inline style).
const ALONE = `:root[${REORDERING}] { view-transition-name: none; } :root[${REORDERING}] [style*='view-transition-name']:not([data-entry]) { view-transition-name: none !important; }`

// The rail's current letter, vermilion with its lozenge shown: the link scroll-target-group makes
// current as its section scrolls into view. Here rather than in the CSS Module, whose parser
// doesn't know :target-current yet; the server renders it, so it works without JavaScript too.
const CURRENT = `.${styles.letter}:target-current { color: var(--color-link); } .${styles.letter}:target-current::after { transform: rotate(45deg) scale(1); }`

/** The rail before Base UI arrives: ordinary links, each its own Tab stop, as without JavaScript. */
function PlainRail({ letters, showing }: RailProps) {
  return (
    <div className={styles.rail}>
      {letters.map(({ letter, id, filled }) =>
        filled && (showing?.has(id) ?? true) ? (
          <a key={id} href={`#${id}`} className={styles.letter} data-rail={id}>
            {letter}
          </a>
        ) : (
          <span key={id} className={cx(styles.letter, styles.blank)}>
            {letter}
          </span>
        ),
      )}
    </div>
  )
}

/** The chips before Base UI arrives: toggle buttons, so an early press already filters. */
function PlainChips({ groups, pressed, onPress }: ChipsProps) {
  return (
    <div role="group" aria-label="Filter the entries" className={styles.chips}>
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
            const on = pressed.includes(chip)
            return (
              <button
                key={chip}
                type="button"
                className={styles.chip}
                aria-pressed={on}
                data-chip={chip}
                data-ink
                onClick={() =>
                  onPress(on ? pressed.filter((other) => other !== chip) : [...pressed, chip])
                }
              >
                <span {...(lang ? { lang } : {})}>{name}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

interface Props {
  letters: readonly RailLetter[]
  groups: readonly ChipGroup[]
  total: number
  /** The search box's label, where the list has one: it narrows the entries to those holding its words. */
  search?: string
  /** The entries, by letter, as the server renders them. */
  children: ReactNode
}

/**
 * The A–Z's controls round its server-rendered list: a rail of letters that stays in view, and
 * filter chips whose state lives in the address. A filter hides the entries whose attributes
 * don't match it, so the list itself never re-renders. Base UI's Toolbar and ToggleGroup (one Tab
 * stop each, arrow keys between) load when the browser is idle or a pointer or focus comes near;
 * until then the letters are plain links and the chips plain toggle buttons. Without JavaScript
 * the chips are hidden and the whole list shows.
 */
export function AzIndex({ letters, groups, total, search: searchLabel, children }: Props) {
  const known = useMemo(
    () =>
      Object.fromEntries(
        GROUPS.map((group) => [
          group,
          new Set(groups.find((row) => row.group === group)?.chips.map(({ value }) => value)),
        ]),
      ) as Record<(typeof GROUPS)[number], Set<string>>,
    [groups],
  )
  const address = useSyncExternalStore(subscribe, search, noSearch)
  const selection = useMemo(() => readSelection(address, known), [address, known])
  const [typed, setTyped] = useState('')
  const query = useDeferredValue(typed)
  const showing = useMemo(() => showingFor(selection, query), [selection, query])
  const [parts, setParts] = useState<KeyboardParts>()
  const controls = useRef<HTMLDivElement>(null)
  const handoff = useRef<string | undefined>(undefined)

  // A press under way when Base UI arrives finishes on the plain chip first: swapping the
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
  const holdSwap = () => {
    pressing.current = true
    // A press that ends outside the island (dragged away) lets go soon all the same.
    setTimeout(release, 1000)
  }
  const holdSwapForKey = ({ key }: { key: string }) => {
    if (key === ' ' || key === 'Enter') holdSwap()
  }

  const upgrade = useCallback(() => {
    void loadKeyboard().then((loaded) => {
      const swap = () => {
        // A plain chip or letter with focus is about to be replaced: hand focus on to the new one.
        const focused = document.activeElement
        if (focused instanceof HTMLElement && controls.current?.contains(focused))
          handoff.current = focused.dataset.chip ?? focused.dataset.rail
        setParts(() => loaded)
      }
      if (pressing.current) waiting.current = swap
      else swap()
    })
  }, [])

  useEffect(() => whenIdle(upgrade), [upgrade])

  // In the same commit as the chips and the count, so a view transition sees them change together.
  useLayoutEffect(() => filterList(selection, query), [selection, query])

  useEffect(() => {
    const key = handoff.current
    if (!parts || !key) return
    handoff.current = undefined
    controls.current
      ?.querySelector<HTMLElement>(`[data-chip="${key}"], [data-rail="${key}"]`)
      ?.focus({ preventScroll: true })
  }, [parts])

  const press = (pressed: string[]) => {
    const next = fromChips(pressed)
    reorder(selection, next, () => flushSync(() => go(next)))
  }

  const Rail = parts?.Rail ?? PlainRail
  const Chips = parts?.Chips ?? PlainChips
  // The rail follows a press a moment later, and only when it changes which letters are links:
  // the press itself then has only the chips and the count to redraw.
  const later = useDeferredValue(showing)
  const letterKey = later ? [...later.letters].join(' ') : null
  const shownLetters = useMemo(
    () => (letterKey === null ? null : new Set(letterKey.split(' ').filter(Boolean))),
    [letterKey],
  )
  const rail = useMemo(
    () => <Rail letters={letters} showing={shownLetters} />,
    [Rail, letters, shownLetters],
  )
  const pressed = useMemo(() => toChips(selection), [selection])
  const count = showing?.count ?? total

  return (
    <div
      ref={controls}
      className={styles.index}
      onPointerEnter={parts ? undefined : upgrade}
      onFocus={parts ? undefined : upgrade}
      onPointerDown={parts ? undefined : holdSwap}
      onKeyDown={parts ? undefined : holdSwapForKey}
      onPointerUp={parts ? undefined : release}
      onPointerCancel={parts ? undefined : release}
      onKeyUp={parts ? undefined : release}
    >
      <style>{`${FLIGHTS}${ALONE}${CURRENT}`}</style>
      <div className={styles.filters}>
        {searchLabel ? (
          <label className={styles.search}>
            <span className={styles.groupLabel}>{searchLabel}</span>
            <input
              type="search"
              className={styles.searchBox}
              value={typed}
              onChange={(event) => setTyped(event.currentTarget.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        ) : null}
        <Chips groups={groups} pressed={pressed} onPress={press} />
        <div className={styles.tally}>
          <p className={styles.count} aria-live="polite" aria-atomic="true">
            {entries(count)}
          </p>
          {isEmpty(selection) && typed === '' ? null : (
            <button
              type="button"
              className={styles.clear}
              data-ink
              onClick={() => {
                setTyped('')
                press([])
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      <nav aria-label="Letters" className={styles.railBand}>
        {rail}
      </nav>
      {count === 0 ? (
        <p className={styles.none}>
          No entry has all of these. Press a chip again or shorten the search to let its entries
          back in, or clear the filters.
        </p>
      ) : null}
      <div id={LIST}>{children}</div>
    </div>
  )
}
