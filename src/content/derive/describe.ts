/**
 * What each public page says about itself: the name its title shows, and the sentence that
 * describes it, its summary where it has one, otherwise one plain sentence about what it holds.
 */
import type { Features } from '@/config/features'
import { siteConfig as config } from '@/config/site'

import type { ContentGraph } from '../graph'
import type { PageDescription } from '../types'
import { byName } from '../views/common'
import { displayName } from '../views/names'
import { normalise, pageRoutes, type PageRoute } from './routes'

/** "1 entry", "20 entries". */
function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

function described(graph: ContentGraph, { entry, record }: PageRoute): PageDescription {
  const page = { path: entry.path, kind: entry.kind, name: entry.title }
  const id = record?.id ?? ''
  switch (entry.kind) {
    case 'concept': {
      const concept = graph.record('concept', id)
      if (!concept) return page
      // A Sanskrit headword is named with its gloss, as the Concept page sets them.
      const { term, english } = concept.name
      const name = term && english ? `${displayName(concept.name)} (${english})` : page.name
      return { ...page, name, description: concept.summary }
    }
    case 'topic': {
      const n = graph.conceptsInTopic(id).primary.length
      const quote = n === 1 ? 'it quotes' : 'they quote'
      const concepts = count(n, 'Concept', 'Concepts')
      return {
        ...page,
        description: `${concepts} in the topic “${page.name}”, and the verses ${quote}.`,
      }
    }
    case 'work':
      return {
        ...page,
        description: `Every verse of the ${page.name} that ${config.name} quotes, with its translations and the Concepts that quote it.`,
      }
    case 'questionnaire':
    case 'questionnaire-flow': {
      const questionnaire = graph.record('questionnaire', id)
      if (!questionnaire) return page
      const { title, summary } = questionnaire
      return entry.kind === 'questionnaire'
        ? { ...page, description: summary ?? `What the ${title} is for, and its limits.` }
        : { ...page, name: `Take the ${title}`, description: `The ${title}, one part at a time.` }
    }
    case 'library': {
      const byTitle = (a: { title: string }, b: { title: string }) => byName(a.title, b.title)
      const titles = [
        'References',
        ...[...graph.records('resource-list')].sort(byTitle).map(({ title }) => title),
        ...[...graph.records('page')].sort(byTitle).map(({ title }) => title),
      ]
      const listed = `${titles.slice(0, -1).join(', ')} and ${titles.at(-1)}`
      return { ...page, description: `The ${config.name} Library: ${listed}.` }
    }
    case 'resource-list': {
      const list = graph.record('resource-list', id)
      if (!list) return page
      const entries = list.groups.reduce((sum, group) => sum + group.items.length, 0)
      return {
        ...page,
        description: `${count(entries, 'entry', 'entries')} on the ${page.name} list in the ${config.name} Library.`,
      }
    }
    case 'page': {
      const libraryPage = graph.record('page', id)
      return libraryPage ? { ...page, description: libraryPage.summary } : page
    }
    default:
      return page
  }
}

/**
 * The public page at a path, described: the path read as the route registry writes it, so it
 * answers wherever the breadcrumb trail does. A path that isn't a public page in this build is
 * none.
 */
export function describe(
  graph: ContentGraph,
  flags: Features,
  path: string,
): PageDescription | null {
  const at = normalise(path)
  const route = pageRoutes(graph, flags).find(({ entry }) => entry.path === at)
  return route ? described(graph, route) : null
}
