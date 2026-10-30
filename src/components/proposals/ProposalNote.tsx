import Link from 'next/link'
import type { ReactNode } from 'react'

import { hrefFor } from '@/content'
import { cx } from '@/lib/cx'

import styles from './ProposalNote.module.css'

export interface ProposalNoteProps {
  /** A short sentence beside the label, such as what the proposal awaits. Omit it for the label alone. */
  children?: ReactNode
  className?: string
  /** On the proposals page itself, the label names the page rather than linking to it. */
  here?: boolean
}

/**
 * The label on every Proposal surface (D20), in the editor's blue pencil: "Proposal", linking to
 * the proposals page, which exists whenever a Proposal does. Beside a page's heading it carries a
 * sentence saying the proposal awaits the Project owner's decision.
 */
export function ProposalNote({ children, className, here = false }: ProposalNoteProps) {
  return (
    <span className={cx(styles.note, className)}>
      {here ? (
        <span className={styles.label}>Proposal</span>
      ) : (
        <Link href={hrefFor({ page: 'proposals' })} className={styles.label}>
          Proposal
        </Link>
      )}
      {children ? <span className={styles.text}>{children}</span> : null}
    </span>
  )
}
