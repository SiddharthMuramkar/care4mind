'use client'

import * as m from 'motion/react-m'
import {
  createContext,
  type ReactNode,
  use,
  useDeferredValue,
  useState,
  ViewTransition,
} from 'react'

import type { SanskritTerm } from '@/content'
import { capitalise } from '@/lib/text'

import { Kolam } from './Kolam'
import styles from './ScriptChoice.module.css'

type Choice = [devanagariFirst: boolean, choose: (devanagariFirst: boolean) => void]

const DevanagariFirst = createContext<Choice>([false, () => {}])

/**
 * Which script leads a term's heading, as the visitor chose with the
 * "Devanagari first" switch. The choice lasts for this page view only.
 */
export function ScriptChoice({ children }: { children: ReactNode }) {
  const choice = useState(false)
  return <DevanagariFirst value={choice}>{children}</DevanagariFirst>
}

/**
 * A term's two spellings, IAST and Devanagari, the chosen one first. Each
 * keeps its own lang tag (WCAG 3.1.2) in either order. When the choice
 * changes they trade places through a view transition (`script-swap` in
 * globals.css); the switch answers at once, and the spellings follow.
 */
export function TermSpellings({
  term,
  capitalised = false,
  name,
}: {
  term: SanskritTerm
  capitalised?: boolean
  /** A view-transition name for the IAST spelling, so a title elsewhere can fly into it. */
  name?: string
}) {
  // A deferred value re-renders in a transition, which is what runs a <ViewTransition>.
  const devanagariFirst = useDeferredValue(use(DevanagariFirst)[0])
  // Each spelling keeps its key wherever it stands, so a swap moves it rather than rewriting its text.
  const iast = (
    <ViewTransition
      key="iast"
      name={name}
      share="morph"
      update={devanagariFirst ? 'script-swap script-follow' : 'script-swap script-lead'}
      default="none"
    >
      <span lang="sa-Latn">{capitalised ? capitalise(term.iast) : term.iast}</span>
    </ViewTransition>
  )
  if (!term.devanagari) return iast
  const devanagari = (
    <ViewTransition
      key="deva"
      update={devanagariFirst ? 'script-swap script-lead' : 'script-swap script-follow'}
      default="none"
    >
      <span lang="sa-Deva">{term.devanagari}</span>
    </ViewTransition>
  )
  const [first, second] = devanagariFirst ? [devanagari, iast] : [iast, devanagari]
  return (
    <span className={styles.spellings}>
      {first} {second}
    </span>
  )
}

// Settles in --duration-move (0.32 s), as the spellings do. Under reduced motion Motion jumps it instead.
const SPRING = { type: 'spring', visualDuration: 0.32, bounce: 0.4 } as const

/**
 * The "Devanagari first" switch: a toggle button that reorders the
 * TermSpellings around it. Its track is the logo's mark, one line looped
 * round two dots, and its knob is a dot that springs from one loop to the other.
 */
export function ScriptSwitch() {
  const [devanagariFirst, choose] = use(DevanagariFirst)
  return (
    <button
      type="button"
      className={styles.switch}
      aria-pressed={devanagariFirst}
      onClick={() => choose(!devanagariFirst)}
    >
      <span className={styles.track} aria-hidden>
        <Kolam columns={2} rows={1} className={styles.loops} />
        <m.span
          className={styles.knob}
          initial={false}
          animate={{ x: devanagariFirst ? '100%' : '0%' }}
          transition={SPRING}
        />
      </span>
      Devanagari first
    </button>
  )
}
