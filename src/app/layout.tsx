import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { HydrationMarker } from '@/components/HydrationMarker'
import { InkSpread } from '@/components/InkSpread'
import { LateFonts } from '@/components/LateFonts'
import { LotusPointer } from '@/components/LotusPointer'
import { LinkPreviewRoot } from '@/components/preview/LinkPreviewRoot'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { Toaster } from '@/components/toast/Toaster'
import { siteConfig } from '@/config/site'
import { home } from '@/content'
import { playfairDisplay, playfairText, playfairTextStyles } from '@/fonts/playfair'
import { tiroDevanagariSanskrit } from '@/fonts/tiro-devanagari-sanskrit'

import '@/styles/globals.css'

// The icons are the files beside this layout: an `icons` field would hide them (Next uses one or the other).
export async function generateMetadata(): Promise<Metadata> {
  return {
    // Share-card URLs are absolute and name the production host, even on a preview.
    metadataBase: new URL(siteConfig.url),
    title: { default: `${siteConfig.name}: Indian psychology` },
    description: (await home.get()).tagline,
    robots: siteConfig.indexable
      ? undefined
      : { index: false, follow: false, googleBot: { index: false, follow: false } },
  }
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
      // The head scripts mark <html> with the reader's choices before React hydrates.
      suppressHydrationWarning
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Toaster />
        <LinkPreviewRoot />
        <InkSpread />
        <LotusPointer />
        <HydrationMarker />
        <LateFonts faces={[...playfairTextStyles, playfairDisplay, tiroDevanagariSanskrit]} />
      </body>
    </html>
  )
}
