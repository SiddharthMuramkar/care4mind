import { site } from '@/config/site'
import { CARD_SIZE, shareCard } from '@/lib/share-card'

export const alt = site.name
export const size = CARD_SIZE
export const contentType = 'image/png'

export default function Image() {
  return shareCard('/concepts/map/')
}
