/**
 * What every page tells browsers and search engines about itself (D19, NFR-04): its title, its
 * description and its canonical address. A page asks by its path, and the route registry and
 * the page's own content supply the rest, so no page writes its metadata by hand.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { site as config } from '@/config/site'
import { concepts, library, questionnaires, site, topics, type RouteEntry } from '@/content'

/** The homepage keeps the site's own title. */
const HOME_TITLE = `${config.name}: Indian psychology`

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
  proposals: 'Features proposed beyond the brief, for the Project owner to accept or refuse.',
}

/** The 404 page's metadata: a title, and no canonical address, as it is no page of the site. */
export const notFoundMetadata: Metadata = { title: { absolute: `Page not found · ${config.name}` } }

/** A path on the production site, as an absolute URL: canonical addresses and the sitemap. */
export function absoluteUrl(path: string): string {
  return new URL(path, config.url).href
}

/** The path's segment where its route's pattern has `[slug]`. */
function slugOf(route: RouteEntry): string {
  const at = route.pattern.split('/').indexOf('[slug]')
  return route.path.split('/')[at] ?? ''
}

/** "1 entry", "20 entries". */
function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

/**
 * The name the page goes by in its title, and the sentence that describes it: its summary where
 * it has one, otherwise one plain sentence about what the page holds.
 */
async function describe(route: RouteEntry): Promise<{ name: string; description: string }> {
  const name = route.title
  switch (route.kind) {
    case 'home':
      return { name: HOME_TITLE, description: config.tagline }
    case 'concept': {
      const concept = await concepts.get(slugOf(route))
      if (!concept) notFound()
      // A Sanskrit headword is named with its gloss, as the Concept page sets them.
      const named = concept.term && concept.english ? `${name} (${concept.english})` : name
      return { name: named, description: concept.summary }
    }
    case 'topic': {
      const topic = await topics.get(slugOf(route))
      if (!topic) notFound()
      const concepts = count(topic.conceptCount, 'Concept', 'Concepts')
      const quote = topic.conceptCount === 1 ? 'it quotes' : 'they quote'
      return { name, description: `${concepts} in the topic “${name}”, and the verses ${quote}.` }
    }
    case 'work':
      return {
        name,
        description: `Every verse of the ${name} that Care4Mind quotes, with its translations and the Concepts that quote it.`,
      }
    case 'questionnaire':
    case 'questionnaire-flow': {
      const questionnaire = await questionnaires.get(slugOf(route))
      if (!questionnaire) notFound()
      const { title, summary } = questionnaire
      return route.kind === 'questionnaire'
        ? { name, description: summary ?? `What the ${title} is for, and its limits.` }
        : { name: `Take the ${title}`, description: `The ${title}, one part at a time.` }
    }
    case 'library': {
      const titles = ['References', ...(await library.list()).map((page) => page.title)]
      const listed = `${titles.slice(0, -1).join(', ')} and ${titles.at(-1)}`
      return { name, description: `The Care4Mind Library: ${listed}.` }
    }
    case 'resource-list':
    case 'page': {
      const page = await library.get(slugOf(route))
      if (!page) notFound()
      if (page.kind === 'page') return { name, description: page.summary }
      const entries = page.groups.reduce((sum, group) => sum + group.items.length, 0)
      return {
        name,
        description: `${count(entries, 'entry', 'entries')} on the ${name} list in the Care4Mind Library.`,
      }
    }
    default:
      return { name, description: ABOUT[route.kind] ?? '' }
  }
}

/**
 * The title ("{name} · Care4Mind"), description and canonical address of the public page at a
 * path. The canonical address is the production one, with its trailing slash and no query. A
 * path that is no public page in this build (an unknown slug, or a feature switched off) is not
 * found, so the page answers 404.
 */
export async function metadataFor(path: string): Promise<Metadata> {
  const bare = path.replace(/[?#].*$/, '')
  const route = (await site.routes()).find((entry) => entry.path === bare)
  if (!route) notFound()
  const { name, description } = await describe(route)
  return {
    title: { absolute: route.kind === 'home' ? name : `${name} · ${config.name}` },
    description,
    alternates: { canonical: absoluteUrl(route.path) },
  }
}
