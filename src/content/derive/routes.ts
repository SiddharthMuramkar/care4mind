/**
 * The route registry: one entry per public page in design B2, for the content present and this
 * build's feature flags. The end-to-end tests, the sitemap and the link crawler all read it.
 */
import { proposalsPageOn, type Features } from '@/config/features'

import type { ContentGraph } from '../graph'
import type { FixedPage, LatinScript, RouteEntry, RouteKind } from '../types'
import { byName } from '../views/common'
import { hrefFor } from '../views/href'
import { displayName } from '../names'
import { latinScript } from '../views/passage'
import { canTake } from '../views/questionnaire'

/** A route, with the language of its title where that is IAST. */
export interface PageRoute {
  entry: RouteEntry
  lang?: LatinScript
}

/** A fixed page's route: its path is its pattern. Titles are the site map's own labels. */
function fixed(page: FixedPage, kind: RouteKind, title: string, proposal = false): PageRoute {
  const path = hrefFor({ page })
  return { entry: { path, kind, pattern: path, title, ...(proposal ? { proposal: true } : {}) } }
}

/** A path as the route registry writes it: no query or fragment, with its trailing slash. */
export function normalise(path: string): string {
  const bare = path.replace(/[?#].*$/, '')
  const rooted = bare.startsWith('/') ? bare : `/${bare}`
  return rooted.endsWith('/') ? rooted : `${rooted}/`
}

const byPath = (a: PageRoute, b: PageRoute) => byName(a.entry.path, b.entry.path)

/**
 * Every public page, in the site map's order, each kind's first marked as its sample. A route
 * whose feature flag is off is left out (settled rule 17), a Questionnaire coming later has none
 * (it is an anchor on the Questionnaires page), and `/topics/` is a redirect, not a route.
 */
export function pageRoutes(graph: ContentGraph, flags: Features): PageRoute[] {
  const concepts: PageRoute[] = graph.records('concept').map((concept) => ({
    entry: {
      path: hrefFor({ kind: 'concept', id: concept.slug }),
      kind: 'concept',
      pattern: '/concepts/[slug]/',
      title: displayName(concept.name),
      record: { kind: 'concept', id: concept.slug },
    },
    ...(concept.name.term ? { lang: 'sa-Latn' as const } : {}),
  }))

  const topics: PageRoute[] = [...graph.records('topic')]
    .sort((a, b) => a.order - b.order)
    .map((topic) => ({
      entry: {
        path: hrefFor({ kind: 'topic', id: topic.slug }),
        kind: 'topic',
        pattern: '/topics/[slug]/',
        title: topic.name.english,
        record: { kind: 'topic', id: topic.slug },
      },
    }))

  const works: PageRoute[] = graph.records('work').map((work) => ({
    entry: {
      path: hrefFor({ kind: 'work', id: work.slug }),
      kind: 'work',
      pattern: '/texts/[slug]/',
      title: displayName({ term: work.title }),
      record: { kind: 'work', id: work.slug },
    },
    lang: latinScript(work),
  }))

  const questionnaires: PageRoute[] = [...graph.records('questionnaire')]
    .filter((questionnaire) => questionnaire.status !== 'coming-later')
    .sort((a, b) => byName(a.slug, b.slug))
    .flatMap((questionnaire) => {
      const target = { kind: 'questionnaire', id: questionnaire.slug } as const
      const intro: PageRoute = {
        entry: {
          path: hrefFor({ ...target, status: questionnaire.status }),
          kind: 'questionnaire',
          pattern: '/questionnaires/[slug]/',
          title: questionnaire.title,
          record: target,
        },
      }
      if (!canTake(questionnaire, flags)) return [intro]
      const flow: PageRoute = {
        entry: {
          path: hrefFor({ ...target, status: questionnaire.status, flow: true }),
          kind: 'questionnaire-flow',
          pattern: '/questionnaires/[slug]/take/',
          title: 'Take it',
          record: target,
        },
      }
      return [intro, flow]
    })

  const library: PageRoute[] = [...graph.records('resource-list'), ...graph.records('page')].map(
    (record) => ({
      entry: {
        path: hrefFor({ kind: record.kind, id: record.slug }),
        kind: record.kind,
        pattern: '/library/[slug]/',
        title: record.title,
        record: { kind: record.kind, id: record.slug },
      },
    }),
  )

  const routes: PageRoute[] = [
    fixed('home', 'home', 'Home'),
    ...(flags.startHere ? [fixed('start', 'start', 'Start here', true)] : []),
    fixed('concepts', 'concepts', 'Concepts'),
    ...concepts.sort(byPath),
    ...(flags.conceptMap ? [fixed('concept-map', 'concept-map', 'Concept map', true)] : []),
    ...topics,
    fixed('texts', 'texts', 'Traditional texts'),
    ...works.sort(byPath),
    fixed('questionnaires', 'questionnaires', 'Questionnaires'),
    ...questionnaires,
    fixed('library', 'library', 'Library'),
    fixed('references', 'references', 'References'),
    ...library.sort(byPath),
    fixed('search', 'search', 'Search'),
    ...(proposalsPageOn(flags) ? [fixed('proposals', 'proposals', 'Proposals', true)] : []),
  ]

  const sampled = new Set<RouteKind>()
  return routes.map((route) => {
    if (sampled.has(route.entry.kind)) return route
    sampled.add(route.entry.kind)
    return { ...route, entry: { ...route.entry, sample: true } }
  })
}

/** The route registry: every public page's path, kind, page-file pattern and title. */
export function routes(graph: ContentGraph, flags: Features): RouteEntry[] {
  return pageRoutes(graph, flags).map(({ entry }) => entry)
}
