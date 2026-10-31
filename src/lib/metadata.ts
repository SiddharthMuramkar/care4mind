/**
 * What every page tells browsers and search engines about itself (D19, NFR-04): its title, its
 * description and its canonical address, as Next's metadata. A page asks by its path, and
 * `site.describe` supplies the rest, so no page writes its metadata by hand.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { site as config } from '@/config/site'
import { site, type RouteKind } from '@/content'

/** The homepage keeps the site's own title. */
const HOME_TITLE = `${config.name}: Indian psychology`

/** One sentence each for the pages with no summary of their own. */
const ABOUT: Partial<Record<RouteKind, string>> = {
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

/**
 * The title ("{name} · Care4Mind"), description and canonical address of the public page at a
 * path. The canonical address is the production one, with its trailing slash and no query. A
 * path that is no public page in this build (an unknown slug, or a feature switched off) is not
 * found, so the page answers 404.
 */
export async function metadataFor(path: string): Promise<Metadata> {
  const page = await site.describe(path)
  if (!page) notFound()
  const home = page.kind === 'home'
  return {
    title: { absolute: home ? HOME_TITLE : `${page.name} · ${config.name}` },
    description: page.description ?? (home ? config.tagline : (ABOUT[page.kind] ?? '')),
    alternates: { canonical: absoluteUrl(page.path) },
  }
}
