import type { Metadata } from 'next'
import Link from 'next/link'

// Temporary during ticket 21, Step 1: the real homepage replaces this once a direction is picked.
export const metadata: Metadata = { title: 'Care4Mind rebuild preview' }

export default function PreviewHome() {
  return (
    <main
      id="main"
      style={{ maxWidth: '40rem', margin: '0 auto', padding: '4rem 1rem', fontFamily: 'system-ui' }}
    >
      <h1>Care4Mind rebuild preview</h1>
      <p>This preview shows three possible looks for the new site.</p>
      <p>
        <Link href="/directions">See the three design directions</Link>
      </p>
    </main>
  )
}
