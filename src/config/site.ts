/**
 * Site-wide settings that change at launch.
 *
 * `indexable` is the single switch for search engines. Until launch every page
 * sends `noindex` twice: as a robots meta tag (root layout) and as an
 * `X-Robots-Tag` header (next.config.ts). Flip it only as part of the launch
 * cutover, never for a preview.
 */
export const site = {
  name: 'Care4Mind',
  tagline: 'Indic ways to invoke a perfect balanced mind',
  indexable: false,
} as const
