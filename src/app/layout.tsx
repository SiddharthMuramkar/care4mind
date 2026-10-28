import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { HydrationMarker } from '@/components/HydrationMarker'
import { InkSpread } from '@/components/InkSpread'
import { LateFonts } from '@/components/LateFonts'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { site } from '@/config/site'
import { playfairDisplay, playfairText, playfairTextStyles } from '@/fonts/playfair'
import { tiroDevanagariSanskrit } from '@/fonts/tiro-devanagari-sanskrit'

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
      // Smooth scrolling is for in-page links: with this, Next.js jumps on page changes.
      data-scroll-behavior="smooth"
      className={playfairText.variable}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <InkSpread />
        <HydrationMarker />
        <LateFonts faces={[...playfairTextStyles, playfairDisplay, tiroDevanagariSanskrit]} />
      </body>
    </html>
  )
}
