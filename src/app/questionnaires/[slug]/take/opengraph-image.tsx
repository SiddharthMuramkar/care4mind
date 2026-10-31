import { site } from '@/config/site'
import { shareCard } from '@/lib/share-card'

export { generateStaticParams } from './page'

export const dynamicParams = false
export const alt = site.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return shareCard('/questionnaires/[slug]/take/', (await params).slug)
}
