/**
 * The breadcrumb trail for any public page: Home first, the page itself last.
 */
import type { Features } from '@/config/features'

import type { ContentGraph } from '../graph'
import { displayName } from '../names'
import type { Crumb } from '../types'
import { hrefFor } from '../views/href'
import { pageRoutes, type PageRoute } from './routes'

/** A path as the route registry writes it: no query or fragment, with its trailing slash. */
function normalise(path: string): string {
  const bare = path.replace(/[?#].*$/, '')
  const rooted = bare.startsWith('/') ? bare : `/${bare}`
  return rooted.endsWith('/') ? rooted : `${rooted}/`
}

/** The paths above a path, shortest first: `/a/b/` → `/`, `/a/`. */
function pathsAbove(path: string): string[] {
  const segments = path.split('/').filter(Boolean)
  return segments.map((_, depth) => (depth === 0 ? '/' : `/${segments.slice(0, depth).join('/')}/`))
}

function crumb(route: PageRoute, graph: ContentGraph): Crumb {
  const { entry, lang, gloss, record } = route
  // A Concept's crumb keeps its IAST label and gloss apart, though its route title joins them.
  const concept = record?.kind === 'concept' ? graph.record('concept', record.id) : undefined
  const label = concept && gloss ? displayName(concept.name) : entry.title
  return { label, href: entry.path, ...(lang ? { lang } : {}), ...(gloss ? { gloss } : {}) }
}

/**
 * The trail to a page: each page above it in the site map that exists, then the page itself.
 * Two pages sit elsewhere than their path says: a topic sits under Concepts, and a Concept
 * under its primary topic. A path that isn't a public page in this build has no trail.
 */
export function trail(graph: ContentGraph, flags: Features, path: string): Crumb[] {
  const routes = new Map<string, PageRoute>(
    pageRoutes(graph, flags).map((route) => [route.entry.path, route]),
  )
  const page = routes.get(normalise(path))
  if (!page) return []

  const above: PageRoute[] = []
  const add = (at: string) => {
    const route = routes.get(at)
    if (route) above.push(route)
  }
  pathsAbove(page.entry.path).forEach(add)
  const { kind, id } = page.record ?? {}
  if (kind === 'topic') add(hrefFor({ page: 'concepts' }))
  if (kind === 'concept' && id !== undefined) {
    const topic = graph.record('concept', id)?.topics.primary
    if (topic !== undefined) add(hrefFor({ kind: 'topic', id: topic }))
  }
  return [...above, page].map((route) => crumb(route, graph))
}
