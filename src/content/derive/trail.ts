/**
 * The breadcrumb trail of design B6 (D15) for any public page: Home first, the page itself last.
 */
import type { Features } from '@/config/features'

import type { ContentGraph } from '../graph'
import type { Crumb } from '../types'
import { hrefFor } from '../views/href'
import { normalise, pageRoutes, type PageRoute } from './routes'

/** The paths above a path, shortest first: `/a/b/` → `/`, `/a/`. */
function pathsAbove(path: string): string[] {
  const segments = path.split('/').filter(Boolean)
  return segments.map((_, depth) => (depth === 0 ? '/' : `/${segments.slice(0, depth).join('/')}/`))
}

function crumb({ entry, lang }: PageRoute): Crumb {
  return { label: entry.title, href: entry.path, ...(lang ? { lang } : {}) }
}

/**
 * The trail to a page: each page above it in the site map that exists, then the page itself.
 * Two pages sit elsewhere than their path says (B6): a topic sits under Concepts, and a Concept
 * under its primary topic. A path that isn't a public page in this build has no trail.
 */
export function trail(graph: ContentGraph, flags: Features, path: string): Crumb[] {
  const routes = new Map(pageRoutes(graph, flags).map((route) => [route.entry.path, route]))
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
  return [...above, page].map(crumb)
}
