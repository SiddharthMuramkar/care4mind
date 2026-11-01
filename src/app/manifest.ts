import type { MetadataRoute } from 'next'

import { site } from '@/config/site'
import { home } from '@/content'

/**
 * The web manifest: the name and icons a phone shows for the site on its home screen, which then
 * opens it in the browser. Its colours are --color-ground, written out because a manifest can't
 * read the stylesheet; the icons test keeps them equal.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  return {
    name: site.name,
    short_name: site.name,
    description: (await home.get()).tagline,
    start_url: '/',
    display: 'browser',
    theme_color: '#151a3d',
    background_color: '#151a3d',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
