import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/metadata'

/**
 * robots.txt names the sitemap and blocks nothing. Until launch the noindex header and meta tag
 * keep pages out of search engines, and a crawler has to fetch a page to read them.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
