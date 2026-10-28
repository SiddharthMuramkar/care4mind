import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { hrefFor } from '@/content'
import { cx } from '@/lib/cx'

import styles from './ProposalNote.module.css'

export interface ProposalNoteProps {
  /** A short sentence beside the label, such as what the proposal adds. Omit it for the label alone. */
  children?: ReactNode
  className?: string
}

/**
 * Slot, added by front-end-site ticket 04 and owned by ticket 12 after it: the label on every
 * Proposal surface (D20), reading "Proposal" and linking to the proposals page, which exists
 * whenever a Proposal does. Ticket 12 sets its wording and style; its props stay.
 */
export function ProposalNote({ children, className }: ProposalNoteProps) {
  return (
    <span className={cx(styles.note, className)}>
      <Link href={hrefFor({ page: 'proposals' }) as Route} className={styles.label}>
        Proposal
      </Link>
      {children ? <span className={styles.text}>{children}</span> : null}
    </span>
  )
}
