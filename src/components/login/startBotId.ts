/**
 * BotID's browser half, started once with the login forms and only on the site's own hostnames.
 * Vercel serves BotID's script, so anywhere else (a local run) the request it makes would fail
 * and take the form's own request down with it.
 */
import { initBotId } from 'botid/client/core'

import { authAddress, BOT_CHECK_HOSTNAMES, BOT_CHECKED_PATHS } from '@/lib/auth/shared'

if (typeof window !== 'undefined' && BOT_CHECK_HOSTNAMES.includes(window.location.hostname)) {
  initBotId({
    protect: BOT_CHECKED_PATHS.map((path) => ({ path: authAddress(path), method: 'POST' })),
  })
}
