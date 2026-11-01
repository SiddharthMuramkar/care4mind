import { site } from '@/config/site'
import { CARD_SIZE, shareCard } from '@/lib/share-card'

export { generateStaticParams } from './page'

export const dynamicParams = false
export const alt = site.name
export const size = CARD_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return shareCard('/library/[slug]/', (await params).slug)
}
