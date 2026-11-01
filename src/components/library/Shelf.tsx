import type { Route } from 'next'
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

import { turnForward } from '@/components/PageTurn'
import { cx } from '@/lib/cx'

import styles from './shelf.module.css'

/** The bindings a spine is set on: indigo cloth, pale paper, turmeric and vermilion. */
const TONES = ['ground', 'paper', 'accent', 'ground', 'highlight', 'paper'] as const

/** A number from 0 to 1 that a name always gives, so a book keeps its height from build to build. */
function measure(name: string): number {
  let hash = 5381
  for (const character of name) hash = ((hash * 33) ^ character.charCodeAt(0)) >>> 0
  return (hash % 1000) / 999
}

/** The binding the book at this place on a shelf has: neighbours never share one. */
export const toneAt = (index: number) => TONES[index % TONES.length]

export interface SpineProps {
  /** A page of the site (turning the page forward), or a book's entry on this page (`#ref-…`). */
  href: Route | `#${string}`
  /** Names the spine's height and thickness, the same on every build. */
  name: string
  /** Its place on the shelf, which picks its binding. */
  index: number
  /** Set at the head, read across: a Devanagari numeral. Decoration. */
  head?: ReactNode
  /** The title, set up the spine. */
  title: ReactNode
  /** Set at the foot: the author, or what a volume holds. */
  foot?: ReactNode
  /** How thick it is, 0 to 1, where that says something (a volume's size); else from its name. */
  thickness?: number
}

/**
 * A book on a shelf, set in type: its title up the spine, with gilt rules at head and foot. The
 * whole spine is one link. It stands with its neighbours on a wide screen; a shelf may set it as
 * a line of a list on a narrow one.
 */
export function Spine({ href, name, index, head, title, foot, thickness }: SpineProps) {
  const style = {
    '--height': measure(name),
    '--thickness': thickness ?? measure(`${name}/thickness`),
    '--at': index,
  } as CSSProperties
  const inner = (
    <>
      {head ? (
        <span className={styles.head} aria-hidden>
          {head}
        </span>
      ) : null}
      <span className={styles.title}>{title}</span>
      {foot ? <span className={styles.foot}>{foot}</span> : null}
    </>
  )
  return (
    <li className={styles.slot} style={style}>
      {href.startsWith('#') ? (
        <a href={href} className={styles.spine} data-tone={toneAt(index)} data-ink>
          {inner}
        </a>
      ) : (
        <Link
          href={href as Route}
          className={styles.spine}
          data-tone={toneAt(index)}
          transitionTypes={[...turnForward]}
          data-ink
        >
          {inner}
        </Link>
      )}
    </li>
  )
}

/** What a volume holds: a number on its spine, in words to a screen reader and on a phone. */
export function Holds({ count, unit }: { count: number; unit: string }) {
  return (
    <>
      {count}
      <span className={styles.unit}> {unit}</span>
    </>
  )
}

/**
 * A shelf of spines standing on their board. `volumes` sets the Library's five sections, tall
 * and still a list of contents on a phone; `books` sets a reading list's books, which on a phone
 * leave the list below them to stand alone.
 */
export function Shelf({
  label,
  kind,
  children,
}: {
  label: string
  kind: 'volumes' | 'books'
  children: ReactNode
}) {
  return (
    <nav aria-label={label} className={cx(styles.shelf, styles[kind])}>
      <ul className={styles.row}>{children}</ul>
    </nav>
  )
}
