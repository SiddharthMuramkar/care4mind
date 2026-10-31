import type { Route } from 'next'
import Link from 'next/link'

import { site, type Crumb } from '@/content'

import styles from './Breadcrumbs.module.css'
import { turnBack } from '../PageTurn'

/** A transliterated crumb's language tag; none for an English one. */
const langOf = (crumb: Crumb) => (crumb.lang ? { lang: crumb.lang } : {})

/**
 * FR-01: every page below the homepage shows where it sits, as design B6 lays out (D15). The
 * trail is the route registry's, so it follows the site map; the last crumb is the page itself.
 * Going back up turns the page back.
 */
export async function Breadcrumbs({ path }: { path: string }) {
  const trail = await site.trail(path)
  const here = trail.at(-1)
  if (!here || trail.length < 2) throw new Error(`No page below the homepage is at ${path}.`)
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <ol>
        {trail.slice(0, -1).map((crumb) => (
          <li key={crumb.href}>
            {/* The registry's paths are made by hrefFor(). */}
            <Link href={crumb.href as Route} {...langOf(crumb)} transitionTypes={turnBack}>
              {crumb.label}
            </Link>
          </li>
        ))}
        <li>
          <span aria-current="page" {...langOf(here)}>
            {here.label}
          </span>
        </li>
      </ol>
    </nav>
  )
}
