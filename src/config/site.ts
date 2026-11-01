/**
 * Site-wide settings that change at launch.
 *
 * `indexable` is the single switch for search engines. Until launch every page
 * sends `noindex` twice: as a robots meta tag (root layout) and as an
 * `X-Robots-Tag` header (next.config.ts). Flip it only as part of the launch
 * cutover, never for a preview.
 *
 * Canonical addresses and the sitemap are built on `url`, so they name one site
 * even on a preview. Until launch it is www.care4mind.xyz, the host the bare
 * domain redirects to; care4mind.org returns at launch, together with
 * `indexable`. Nothing requests it.
 */
export const siteConfig = {
  name: 'Care4Mind',
  url: 'https://www.care4mind.xyz',
  indexable: false,
} as const
