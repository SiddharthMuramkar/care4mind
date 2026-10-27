import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { MotionProvider } from '@/components/MotionProvider'
import { site } from '@/config/site'

import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.tagline,
  robots: site.indexable
    ? undefined
    : { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  )
}
