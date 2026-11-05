import type { Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { site, type Crumb } from '@/content'

import styles from './Breadcrumbs.module.css'
import { turnBack } from '../PageTurn'

/** A crumb's words: its label in its own language where it has one, its gloss plain after it. */
function Words({ crumb }: { crumb: Crumb }) {
  if (!crumb.gloss) return crumb.lang ? <span lang={crumb.lang}>{crumb.label}</span> : crumb.label
  return (
    <>
      <span {...(crumb.lang ? { lang: crumb.lang } : {})}>{crumb.label}</span>
      {' · '}
      {crumb.gloss}
    </>
  )
}

/**
 * FR-01: every page below the homepage shows where it sits. The
 * trail is the route registry's, so it follows the site map; the last crumb is the page itself.
 * Going back up turns the page back. A path the registry doesn't list, such as a switched-off
 * feature's, has no trail, so its page answers 404.
 */
export async function Breadcrumbs({ path }: { path: string }) {
  const trail = await site.trail(path)
  const here = trail.at(-1)
  if (!here) notFound()
  if (trail.length < 2) throw new Error(`No page below the homepage is at ${path}.`)
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <ol>
        {trail.slice(0, -1).map((crumb) => (
          <li key={crumb.href}>
            {/* The registry's paths are made by hrefFor(). */}
            <Link href={crumb.href as Route} transitionTypes={turnBack}>
              <Words crumb={crumb} />
            </Link>
          </li>
        ))}
        <li>
          <span aria-current="page">
            <Words crumb={here} />
          </span>
        </li>
      </ol>
    </nav>
  )
}
