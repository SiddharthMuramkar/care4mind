import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EmailCodeForm, InAppBrowserPrompt } from '@/components/login'
import { ReadingPage } from '@/components/ReadingPage'
import { features } from '@/config/features'
import { hrefFor } from '@/content'
import { turnstileSiteKey } from '@/lib/auth/settings'
import { metadataFor } from '@/lib/metadata'

const PATH = hrefFor({ page: 'log-in' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/** Log in: only an email, then the code sent to it. */
export default function LogInPage() {
  // Not only the metadata: generateMetadata answering 404 doesn't stop this body rendering.
  if (!features.login) notFound()

  return (
    <ReadingPage path={PATH} titleId="log-in-title" title="Log in">
      <noscript>Log in needs JavaScript, so that the bot check can run.</noscript>
      <InAppBrowserPrompt />
      <EmailCodeForm
        mode="log-in"
        siteKey={turnstileSiteKey()}
        otherScreen={hrefFor({ page: 'sign-up' })}
      />
    </ReadingPage>
  )
}
