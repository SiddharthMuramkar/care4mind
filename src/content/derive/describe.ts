/**
 * A public page's name and description: its summary where it has one, otherwise one plain
 * sentence about what the page holds. Page metadata and share cards read only this.
 */
import type { Features } from '@/config/features'
import { count, wordList } from '@/lib/text'

import type { ContentGraph } from '../graph'
import type { PageDescription, RouteEntry } from '../types'
import { byName, must } from '../views/common'
import { normalisePath, routes } from './routes'

/** One sentence each for the pages with no summary of their own. */
const ABOUT: Partial<Record<RouteEntry['kind'], string>> = {
  concepts:
    'Every Concept on Care4Mind, every term explained inside one and every glossary entry, from A to Z.',
  'concept-map':
    'A proposal: the Concepts on one map, joined by the verses, works and rarely cited References they share.',
  texts: 'The traditional texts Care4Mind quotes, with every verse it quotes from each.',
  questionnaires:
    'Every Questionnaire on Care4Mind: what each one is for, and whether you can take it yet.',
  references: 'Every Reference Care4Mind cites, in one style, with the pages that cite it.',
  search: 'Search Care4Mind for a Concept, a term, a verse, a text or a Reference.',
  start:
    'A proposal: what Indian psychology is, how Care4Mind is organised, how to read Sanskrit names and where to begin.',
  proposals: 'Features proposed beyond the brief, for the Project owner to accept or refuse.',
}

function described(graph: ContentGraph, route: RouteEntry): { name: string; description: string } {
  const name = route.title
  // A route that shows a record was built from it, so the graph holds it.
  const shownId = () => {
    if (!route.record) throw new Error(`The page at ${route.path} shows no record.`)
    return route.record.id
  }
  switch (route.kind) {
    case 'home': {
      const home = graph.record('home', 'home')
      if (!home) throw new Error('The content has no homepage record (data/home/home.ts).')
      return { name, description: home.tagline }
    }
    case 'concept':
      return { name, description: must(graph, 'concept', shownId()).summary }
    case 'topic': {
      const held = graph.conceptsInTopic(must(graph, 'topic', shownId()).slug).primary.length
      const concepts = count(held, 'Concept', 'Concepts')
      const quote = held === 1 ? 'it quotes' : 'they quote'
      return { name, description: `${concepts} in the topic “${name}”, and the verses ${quote}.` }
    }
    case 'work':
      return {
        name,
        description: `Every verse of the ${name} that Care4Mind quotes, with its translations and the Concepts that quote it.`,
      }
    case 'questionnaire':
    case 'questionnaire-flow': {
      const { title, summary } = must(graph, 'questionnaire', shownId())
      return route.kind === 'questionnaire'
        ? { name, description: summary ?? `What the ${title} is for, and its limits.` }
        : { name: `Take the ${title}`, description: `The ${title}, one part at a time.` }
    }
    case 'library': {
      const byTitle = <T extends { title: string }>(records: readonly T[]) =>
        [...records].sort((a, b) => byName(a.title, b.title))
      const titles = [
        'References',
        ...[...byTitle(graph.records('resource-list')), ...byTitle(graph.records('page'))].map(
          (page) => page.title,
        ),
      ]
      return { name, description: `The Care4Mind Library: ${wordList(titles)}.` }
    }
    case 'page':
      return { name, description: must(graph, 'page', shownId()).summary }
    case 'resource-list': {
      const entries = must(graph, 'resource-list', shownId()).groups.reduce(
        (sum, group) => sum + group.items.length,
        0,
      )
      return {
        name,
        description: `${count(entries, 'entry', 'entries')} on the ${name} list in the Care4Mind Library.`,
      }
    }
    default:
      return { name, description: ABOUT[route.kind] ?? '' }
  }
}

/** The description of the public page at a path, or null when this build has no such page. */
export function describe(
  graph: ContentGraph,
  flags: Features,
  path: string,
): PageDescription | null {
  const route = routes(graph, flags).find((entry) => entry.path === normalisePath(path))
  if (!route) return null
  return { path: route.path, kind: route.kind, ...described(graph, route) }
}
