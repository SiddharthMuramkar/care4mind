import type { NextConfig } from 'next'

import { readFeatures } from './src/config/read-features'
import { redirects } from './src/config/redirects'
import { siteConfig } from './src/config/site'

const securityHeaders = [
  // A browser treats a file only as the type it was served with.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Another site learns which site a reader came from, never which page.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // No site can frame these pages to trick a reader into clicking something.
  { key: 'X-Frame-Options', value: 'DENY' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Next generates typedRoutes without trailing slashes despite trailingSlash, so it cannot check slashed paths.
  typedRoutes: true,
  // Every address ends with a slash, as the current site's do; the bare one redirects to it.
  trailingSlash: true,
  // Share cards read their fonts from disk at render time, which the file tracer cannot see.
  outputFileTracingIncludes: { '/**/opengraph-image*': ['./src/fonts/**/*.woff'] },
  async headers() {
    const secure = { source: '/:path*', headers: securityHeaders }
    if (siteConfig.indexable) return [secure]
    return [
      secure,
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
  // Login off: every method on the auth route reaches an address that doesn't exist, as if the
  // route didn't. The route's own 404 can't cover OPTIONS or PUT, which Next.js answers itself.
  async rewrites() {
    if (readFeatures(process.env).login) return []
    return {
      beforeFiles: [{ source: '/api/auth/:path*', destination: '/api/login-is-off/' }],
      afterFiles: [],
      fallback: [],
    }
  },
  // The one redirect table, each a 301 rather than Next.js's default 308.
  async redirects() {
    return redirects.map((redirect) => ({ ...redirect, statusCode: 301 as const }))
  },
}

export default nextConfig
