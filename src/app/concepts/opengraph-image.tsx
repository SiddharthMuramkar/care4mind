import { site } from '@/config/site'
import { shareCard } from '@/lib/share-card'

export const alt = site.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return shareCard('/concepts/')
}
