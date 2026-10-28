import type { MetadataRoute } from 'next'

import { site } from '@/content'
import { absoluteUrl } from '@/lib/metadata'

/**
 * The XML sitemap (NFR-04): every public page in the route registry, at its production address.
 * Switched-off features have left the registry, so they leave the sitemap too. Until launch the
 * pages it lists still say noindex.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return (await site.routes()).map(({ path }) => ({ url: absoluteUrl(path) }))
}
