import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import styles from './Breadcrumbs.module.css'

export interface Crumb {
  label: ReactNode
  /** Omit for the current page. */
  href?: Route
}

/** FR-01: every page below the homepage shows where it sits. */
export function Breadcrumbs({ trail }: { trail: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <ol>
        {trail.map((crumb, index) => (
          <li key={index}>
            {crumb.href ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              <span aria-current="page">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
