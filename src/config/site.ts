/**
 * Site-wide settings that change at launch.
 *
 * `indexable` is the single switch for search engines. Until launch every page
 * sends `noindex` twice: as a robots meta tag (root layout) and as an
 * `X-Robots-Tag` header (next.config.ts). Flip it only as part of the launch
 * cutover, never for a preview.
 *
 * `url` is the production origin, which the brief keeps (D19). Canonical
 * addresses and the sitemap are built on it, so they name the real site even
 * on a preview. Nothing requests it.
 */
export const site = {
  name: 'Care4Mind',
  tagline: 'Indic ways to invoke a perfect balanced mind',
  url: 'https://care4mind.org',
  indexable: false,
} as const
