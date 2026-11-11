import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

import { turnBack, turnForward } from '../PageTurn'
import styles from './Pager.module.css'

interface TurnProps {
  href: Route
  /** "prev" leads back and turns the page back; "next" leads on and turns it forward. */
  rel: 'prev' | 'next'
  /** Where it leads, in words: "Previous", "Next", "Next topic". */
  direction: string
  /** The name of the page it opens. */
  name: ReactNode
  /** The English gloss after a Sanskrit name, where it has one. */
  gloss?: string
}

/** One way on from the foot of a page, named by the page it opens. */
export function Turn({ href, rel, direction, name, gloss }: TurnProps) {
  return (
    <Link
      href={href}
      rel={rel}
      transitionTypes={rel === 'next' ? turnForward : turnBack}
      className={rel === 'next' ? styles.next : styles.previous}
      data-ink
    >
      <span className={styles.direction}>{direction}</span>
      <span className={styles.name}>
        {name}
        {gloss ? <span className={styles.gloss}> · {gloss}</span> : null}
      </span>
    </Link>
  )
}

/**
 * The ways on at the foot of a page, set like a book's catchwords: a way back stands on the
 * left, a way on on the right, each a box naming where it leads.
 */
export function Pager({
  label,
  className,
  children,
}: {
  /** The landmark's name, which says what the pager steps through. */
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <nav className={cx(styles.pager, className)} aria-label={label}>
      {children}
    </nav>
  )
}
