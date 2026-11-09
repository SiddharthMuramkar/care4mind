import type { Metadata } from 'next'

import { EmailCodeForm, InAppBrowserPrompt } from '@/components/login'
import { ReadingPage } from '@/components/ReadingPage'
import { hrefFor } from '@/content'
import { turnstileSiteKey } from '@/lib/auth/settings'
import { metadataFor } from '@/lib/metadata'

const PATH = hrefFor({ page: 'sign-up' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/** Sign up: a name and an email, then the code sent to it. */
export default function SignUpPage() {
  return (
    <ReadingPage path={PATH} titleId="sign-up-title" title="Sign up">
      <noscript>
        <p>Sign up needs JavaScript, so that the bot check can run.</p>
      </noscript>
      <InAppBrowserPrompt />
      <EmailCodeForm
        mode="sign-up"
        siteKey={turnstileSiteKey()}
        otherScreen={hrefFor({ page: 'log-in' })}
      />
    </ReadingPage>
  )
}
