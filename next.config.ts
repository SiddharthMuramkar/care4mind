import type { NextConfig } from 'next'

import { redirects } from './src/config/redirects'
import { site } from './src/config/site'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  // Every address ends with a slash (D02), as the current site's do; the bare one redirects to it.
  trailingSlash: true,
  // Share cards read their fonts from disk at render time, which the file tracer cannot see.
  outputFileTracingIncludes: { '/**/opengraph-image*': ['./src/fonts/**/*.woff'] },
  async headers() {
    if (site.indexable) return []
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
  // The one redirect table, each a 301 rather than Next.js's default 308.
  async redirects() {
    return redirects.map((redirect) => ({ ...redirect, statusCode: 301 as const }))
  },
}

export default nextConfig
