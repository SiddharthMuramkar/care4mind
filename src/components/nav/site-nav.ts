import type { Route } from 'next'

import { hrefFor, library, references, site, topics } from '@/content'

import type { Holding, LibraryLink, NavLink, SiteNav } from './types'

// Views give their pages' paths as plain strings; Next's Link wants a Route.
const route = (path: string) => path as Route

let built: Promise<SiteNav> | undefined

/**
 * The navigation every page shares, built once per server from the content module. The Concept
 * map and the proposals page appear only while the route registry has them, so a switched-off
 * feature leaves the navigation with its route (D20).
 */
export function siteNav(): Promise<SiteNav> {
  built ??= build()
  return built
}

async function build(): Promise<SiteNav> {
  const [routes, topicCards, libraryCards, allReferences] = await Promise.all([
    site.routes(),
    topics.list(),
    library.list(),
    references.list(),
  ])
  const has = (kind: string) => routes.some((entry) => entry.kind === kind)
  const link = (label: string, path: string): NavLink => ({ label, href: route(path) })

  const holds = (count: number, one: string, many: string): Holding => ({ count, one, many })
  // In the Library page's order: References, then the Library's lists and pages as it lists them.
  const libraryPages: LibraryLink[] = [
    {
      slug: 'references',
      ...link('References', hrefFor({ page: 'references' })),
      holds: holds(allReferences.length, 'Reference', 'References'),
    },
    ...(await Promise.all(
      libraryCards.map(async (card): Promise<LibraryLink> => {
        const page = { slug: card.slug, ...link(card.title, card.href) }
        if (card.kind === 'resource-list') {
          return { ...page, holds: holds(card.itemCount, 'entry', 'entries') }
        }
        const view = await library.get(card.slug)
        const sections = view?.kind === 'page' ? view.sections.length : 0
        return sections > 0 ? { ...page, holds: holds(sections, 'section', 'sections') } : page
      }),
    )),
  ]

  const topicLinks = [...topicCards]
    .sort((a, b) => a.order - b.order)
    .map((topic) => ({
      slug: topic.slug,
      ...link(topic.name, topic.href),
      ...(topic.term ? { term: topic.term.iast } : {}),
      count: topic.conceptCount,
    }))

  return {
    home: hrefFor({ page: 'home' }),
    sections: [
      {
        id: 'concepts',
        ...link('Concepts', hrefFor({ page: 'concepts' })),
        // A topic sits under Concepts (design B6), wherever its own address is.
        within: [hrefFor({ page: 'concepts' }), ...topicLinks.map((topic) => topic.href)],
      },
      {
        id: 'texts',
        ...link('Texts', hrefFor({ page: 'texts' })),
        within: [hrefFor({ page: 'texts' })],
      },
      {
        id: 'questionnaires',
        ...link('Questionnaires', hrefFor({ page: 'questionnaires' })),
        within: [hrefFor({ page: 'questionnaires' })],
      },
      {
        id: 'library',
        ...link('Library', hrefFor({ page: 'library' })),
        within: [hrefFor({ page: 'library' })],
      },
    ],
    concepts: {
      index: link('Concepts A–Z', hrefFor({ page: 'concepts' })),
      topics: topicLinks,
      ...(has('concept-map') ? { map: link('Concept map', hrefFor({ page: 'concept-map' })) } : {}),
    },
    library: { index: link('Library', hrefFor({ page: 'library' })), pages: libraryPages },
    search: link('Search', hrefFor({ page: 'search' })),
    ...(has('proposals') ? { proposals: link('Proposals', hrefFor({ page: 'proposals' })) } : {}),
  }
}
