/**
 * What every page tells browsers, search engines and link previews about itself (NFR-04):
 * its title, its description, its canonical address and the text of its share card. The
 * content module describes the page; this shapes that description as Next's metadata.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { siteConfig as config } from '@/config/site'
import { site, type PageDescription } from '@/content'

/** The homepage keeps the site's own title. */
const HOME_TITLE = `${config.name}: Indian psychology`

/** The 404 page's metadata: a title, and no canonical address, as it is no page of the site. */
export const notFoundMetadata: Metadata = { title: { absolute: `Page not found · ${config.name}` } }

/** A path on the production site, as an absolute URL: canonical addresses and the sitemap. */
export function absoluteUrl(path: string): string {
  return new URL(path, config.url).href
}

/** The description of the public page at a path, or not found. */
async function described(path: string): Promise<PageDescription> {
  const description = await site.describe(path)
  if (!description) notFound()
  return description
}

/**
 * The title ("{name} · Care4Mind"), description and canonical address of the public page at a
 * path. The canonical address is the production one, with its trailing slash and no query. A
 * path that is no public page in this build (an unknown slug, or a feature switched off) is not
 * found, so the page answers 404.
 */
export async function metadataFor(path: string): Promise<Metadata> {
  const { kind, name, description, path: at } = await described(path)
  const title = kind === 'home' ? HOME_TITLE : `${name} · ${config.name}`
  const canonical = absoluteUrl(at)
  // No `images` here: each route segment's opengraph-image file supplies them, and Next uses one or the other.
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: 'website', siteName: config.name, title, description, url: canonical },
    twitter: { card: 'summary_large_image', title, description },
  }
}

/** The text of the page's share card: the site's name and tagline on the homepage. */
export async function shareCardText(path: string): Promise<{ title: string; description: string }> {
  const { kind, name, description } = await described(path)
  return kind === 'home' ? { title: config.name, description } : { title: name, description }
}
