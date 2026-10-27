import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import styles from './Breadcrumbs.module.css'
import { turnBack } from './PageTurn'

export interface Crumb {
  label: ReactNode
  /** Omit for the current page. */
  href?: Route
}

/** FR-01: every page below the homepage shows where it sits. Going back up turns the page back. */
export function Breadcrumbs({ trail }: { trail: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <ol>
        {trail.map((crumb, index) => (
          <li key={index}>
            {crumb.href ? (
              <Link href={crumb.href} transitionTypes={turnBack}>
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
