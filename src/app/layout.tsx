import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { MotionProvider } from '@/components/MotionProvider'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { site } from '@/config/site'
import { playfairDisplay, playfairText } from '@/fonts/playfair'
import { tiroDevanagariSanskrit } from '@/fonts/tiro-devanagari-sanskrit'
import { cx } from '@/lib/cx'

import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: `${site.name}: Indian psychology`, template: `%s · ${site.name}` },
  description: site.tagline,
  robots: site.indexable
    ? undefined
    : { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#151a3d',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cx(
        playfairText.variable,
        playfairDisplay.variable,
        tiroDevanagariSanskrit.variable,
      )}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </MotionProvider>
      </body>
    </html>
  )
}
