/**
 * BotID's browser half, started once with the login forms and only on the site's own hostnames.
 * Vercel serves BotID's script, so anywhere else (a local run) the request it makes would fail
 * and take the form's own request down with it.
 */
import { initBotId } from 'botid/client/core'

import { authAddress, BOT_CHECK_HOSTNAMES, BOT_CHECKED_PATHS } from '@/lib/auth/shared'

/** BotID's challenge script, which it adds to the page on the first protected request. */
const CHALLENGE_SCRIPT = '/a-4-a/c.js'

/**
 * Start BotID so that a failed challenge script can't stop the form. BotID's patched fetch
 * rejects when the script won't load, and hangs on the next try because the failed tag stays
 * in the page. Instead the request goes out without BotID's header and the server decides:
 * record-only passes it, and blocking gives its own answer.
 */
function startBotId() {
  let challengeFailed = false
  // Captured at the window, so it runs before the script's own onerror rejects BotID's promise.
  window.addEventListener(
    'error',
    ({ target }) => {
      if (target instanceof HTMLScriptElement && target.src.includes(CHALLENGE_SCRIPT)) {
        // Gone, so the next press loads the script afresh instead of waiting on it forever.
        target.remove()
        challengeFailed = true
      }
    },
    true,
  )

  const realFetch = window.fetch
  initBotId({
    protect: BOT_CHECKED_PATHS.map((path) => ({ path: authAddress(path), method: 'POST' })),
  })
  const patchedFetch = window.fetch
  window.fetch = (input, init) =>
    patchedFetch(input, init).catch((error: unknown) => {
      if (!challengeFailed) throw error
      challengeFailed = false
      return realFetch(input, init)
    })
}

if (typeof window !== 'undefined' && BOT_CHECK_HOSTNAMES.includes(window.location.hostname)) {
  startBotId()
}
