'use client'

import {
  type ReactNode,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { flushSync } from 'react-dom'

import { filterStyles, Tally } from '@/components/filters'
import { pushAddress, replaceAddress, useAddressQuery, useKeyboardParts } from '@/components/island'
import { Transliterated } from '@/components/script'
import { cx } from '@/lib/cx'
import { count } from '@/lib/text'

import styles from './AzIndex.module.css'
import {
  DEFAULT_KINDS,
  fromChips,
  GROUPS,
  isDefault,
  readSelection,
  type Selection,
  shownEntries,
  toChips,
  writeSelection,
} from './filter'
import { useRail } from './rail'
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

/** The rail sticks under the header while at least this many entries show: fewer are soon passed. */
const STICKS_FROM = 15

/** Move to a new address, and let the filters read it at once. */
function go(selection: Selection, defaultKinds: readonly string[]) {
  pushAddress(`${window.location.pathname}${writeSelection(selection, defaultKinds)}`)
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
 * Take the reader to an entry and keep it there until the page settles. The browser's own glide
 * to the entry may still be under way when this runs, and a jump made mid-glide is carried past
 * it, so aim again each frame until the scroll rests with the entry in place. A wheel, touch,
 * press or key gives the scroll back to the reader at once.
 */
function settleOn(target: HTMLElement) {
  const inputs = ['wheel', 'touchmove', 'pointerdown', 'keydown'] as const
  let [last, still, frames] = [-1, 0, 0]
  let stopped = false
  const stop = () => {
    stopped = true
    for (const type of inputs) window.removeEventListener(type, stop)
  }
  for (const type of inputs) window.addEventListener(type, stop, { passive: true })
  const frame = () => {
    if (stopped) return
    target.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior })
    still = window.scrollY === last ? still + 1 : 0
    last = window.scrollY
    frames += 1
    if (still >= 3 || frames >= 600) stop()
    else requestAnimationFrame(frame)
  }
  frame()
  return stop
}

/**
 * Once the scroll rests, put an entry or a letter where its link's glide should have left it,
 * if it is not there. A glide already under way when the link is pressed — Tab taking focus
 * into the list glides too, the page being smooth-scrolling — can run to its own end and drop
 * the link's glide, and a long list can still be taking its true heights as the glide is
 * aimed, so the scroll can come to rest far from its mark. Waiting for the rest first leaves
 * a glide that lands true untouched. A wheel, touch, press or key gives the scroll back to
 * the reader at once.
 */
function correctWhenRested(target: HTMLElement) {
  const inputs = ['wheel', 'touchmove', 'pointerdown', 'keydown'] as const
  let stopped = false
  let settle: (() => void) | undefined
  const stop = () => {
    stopped = true
    settle?.()
    for (const type of inputs) window.removeEventListener(type, stop)
  }
  for (const type of inputs) window.addEventListener(type, stop, { passive: true })
  const started = performance.now()
  let [last, resting] = [window.scrollY, started]
  const frame = () => {
    if (stopped) return
    const now = performance.now()
    if (window.scrollY !== last) [last, resting] = [window.scrollY, now]
    if (now - resting < 200 && now - started < 10_000) return requestAnimationFrame(frame)
    // At rest: the mark is the line a glide to the target leaves it on, below the page's
    // scroll padding and the target's own scroll margin — unless the page cannot scroll
    // far enough to bring it there, as with the last letters.
    const line =
      (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) +
      (parseFloat(getComputedStyle(target).scrollMarginTop) || 0)
    const { top } = target.getBoundingClientRect()
    const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1
    if (Math.abs(top - line) <= 1 || (atEnd && top > line)) stop()
    else settle = settleOn(target)
  }
  requestAnimationFrame(frame)
  return stop
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
function showingFor(list: HTMLElement | null, selection: Selection, query: string) {
  if (!list) return null
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
          // A group is no Tab stop of its own: its chips have them.
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
                className={cx(filterStyles.chip, styles.chip)}
                aria-pressed={on}
                data-chip={chip}
                data-ink
                onClick={() =>
                  onPress(on ? pressed.filter((other) => other !== chip) : [...pressed, chip])
                }
              >
                <span {...(lang ? { lang } : {})}>
                  {lang ? name : <Transliterated text={name} />}
                </span>
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
  /** How many entries the plain address shows, before the list is read. */
  total: number
  /** The kinds a plain address shows: the Concept pages, unless the page opens on its own (none: every kind). */
  defaultKinds?: readonly string[]
  /** The search box's label, where the list has one: it narrows the entries to those holding its words. */
  search?: string
  /** The entries, by letter, as the server renders them. */
  children: ReactNode
}

/**
 * The A–Z's controls round its server-rendered list: a rail of letters that stays in view while
 * the list showing is long (on a phone one row that scrolls sideways, see useRail), and filter
 * chips whose state lives in the address. A filter hides the entries whose attributes
 * don't match it, so the list itself never re-renders. Base UI's Toolbar and ToggleGroup (one Tab
 * stop each, arrow keys between) load when the browser is idle or a pointer or focus comes near;
 * until then the letters are plain links and the chips plain toggle buttons. A plain address
 * shows the page's opening kinds. Without JavaScript the chips are hidden and the whole list shows.
 */
export function AzIndex({
  letters,
  groups,
  total,
  defaultKinds = DEFAULT_KINDS,
  search: searchLabel,
  children,
}: Props) {
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
  const address = useAddressQuery()
  const selection = useMemo(
    () => readSelection(address, known, defaultKinds),
    [address, known, defaultKinds],
  )
  const [typed, setTyped] = useState('')
  const query = useDeferredValue(typed)
  // The anchor reveal below runs outside the filter's commit: it reads the search as it stands.
  const latestQuery = useRef('')
  const [showing, setShowing] = useState<ReturnType<typeof showingFor>>(null)
  const { parts, controls, handlers } = useKeyboardParts(loadKeyboard)
  const listRef = useRef<HTMLDivElement>(null)

  // The browser aims its glide to a named entry before the fonts arrive and the list takes its
  // true heights, so a long list's entry can come to rest under the rail: aim again once they
  // have, and keep aiming until the scroll settles (settleOn), as the glide may still be running.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return
    let stop: (() => void) | undefined
    let cancelled = false
    void document.fonts.ready.then(() => {
      const target = document.getElementById(id)
      if (!cancelled && target) stop = settleOn(target)
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])

  // The list is rendered below, so a client mount (Back) can't count it during render. Reading
  // it here keeps the count and the rail in the same commit as the chips.
  useLayoutEffect(() => {
    latestQuery.current = query
    filterList(selection, query)
    setShowing(showingFor(listRef.current, selection, query))
  }, [selection, query])

  // An anchor in the address (an old glossary link) may name an entry the filter hides: let its
  // kind in, then take the reader to it, as the browser could not while it was hidden.
  useEffect(() => {
    const reveal = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      const target = id ? document.getElementById(id) : null
      const entry = target?.closest<HTMLElement>('[data-entry]')
      const kind = entry?.dataset.kind
      if (!target || !entry || !kind || !listRef.current?.contains(entry) || !entry.hidden) return
      const now = readSelection(window.location.search, known, defaultKinds)
      // Hidden by the search or another group, not by its kind: letting the kind in shows nothing.
      if (now.kind.includes(kind)) return
      const next = { ...now, kind: [...now.kind, kind] }
      flushSync(() =>
        replaceAddress(
          `${window.location.pathname}${writeSelection(next, defaultKinds)}${window.location.hash}`,
        ),
      )
      // Show it now (the layout effect repeats this), then settle on it: the entries above are
      // first drawn at a guessed height (content-visibility), so a single jump can land short of
      // the entry or past it, under the rail.
      filterList(next, latestQuery.current)
      settleOn(target)
    }
    reveal()
    window.addEventListener('hashchange', reveal)
    return () => window.removeEventListener('hashchange', reveal)
  }, [known, defaultKinds])

  // A letter's own link glides to its section, but that glide can be dropped by one already
  // under way, or land where the list's heights put the section when it was aimed: when the
  // scroll rests, correct a landing that missed (correctWhenRested). An entry the filter
  // hides is the reveal above's to take the reader to, not this one's.
  useEffect(() => {
    let stop: (() => void) | undefined
    const correct = () => {
      stop?.()
      stop = undefined
      const id = decodeURIComponent(window.location.hash.slice(1))
      const target = id ? document.getElementById(id) : null
      if (!target || !listRef.current?.contains(target) || target.closest('[hidden]')) return
      stop = correctWhenRested(target)
    }
    window.addEventListener('hashchange', correct)
    return () => {
      window.removeEventListener('hashchange', correct)
      stop?.()
    }
  }, [])

  const press = (pressed: string[]) => {
    const next = fromChips(pressed, defaultKinds)
    reorder(selection, next, () => flushSync(() => go(next, defaultKinds)))
  }

  const Rail = parts?.Rail ?? PlainRail
  const Chips = parts?.Chips ?? PlainChips
  // The rail follows a press a moment later, and only when it changes which letters are links:
  // the press itself then has only the chips and the count to redraw. A mount's first count is
  // null, so that one isn't deferred: the letters paint with the count.
  const later = useDeferredValue(showing) ?? showing
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
  const tally = showing?.count ?? total
  const bandRef = useRail(listRef, Rail)

  return (
    <div ref={controls} className={styles.index} {...handlers}>
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
        <Tally
          count={count(tally, 'entry', 'entries')}
          onClear={
            isDefault(selection, defaultKinds) && typed === ''
              ? undefined
              : () => {
                  setTyped('')
                  press([])
                }
          }
          controls={controls}
          className={styles.tally}
          clearClassName={styles.clear}
        />
      </div>
      <nav
        ref={bandRef}
        aria-label="Letters"
        className={styles.railBand}
        {...(tally < STICKS_FROM ? { 'data-short': '' } : {})}
      >
        {rail}
      </nav>
      {tally === 0 ? (
        <p className={styles.none}>
          No entry has all of these. Press a chip again or shorten the search to let its entries
          back in, or clear the filters.
        </p>
      ) : null}
      <div id={LIST} ref={listRef} className={styles.list}>
        {children}
      </div>
    </div>
  )
}
