import type { Page } from '@playwright/test'

import { hrefFor } from '@/content'

import { expect, gotoReady, test } from './fixtures'
import { latencyOf, openOnSlowPhone, recordEventTimings, visitLatency } from './latency'
import { waitForBotCheck } from './login'
import { ROUTES } from './routes'

// NFR-02 with BotID in place. BotID starts only on the site's own hostnames, so the browser is
// told one of them is this machine. Everything of BotID's that runs in the page is the real thing;
// only the challenge script Vercel serves has a stand-in, and the auth route is answered here
// because a browser on this hostname isn't an origin the local server trusts.

const LOGIN_ON = ROUTES.some(({ path }) => path === hrefFor({ page: 'log-in' }))
const HOSTNAME = 'www.care4mind.xyz'
const SITE = `http://${HOSTNAME}:${process.env.E2E_PORT || 3100}`

/** NFR-02's limit on a press, as latency.spec.ts holds every other page to it. */
const BUDGET = 200

/**
 * The most script BotID may add to a login page, in bytes before compression. It is measured alone
 * because a page's total also holds whatever its links prefetch, which says nothing about BotID.
 */
const BOTID_SCRIPT_BUDGET = 10_000

/** A string only BotID's own browser code holds: the path of the script it loads. */
const BOTID_MARK = '149e9513-01fa-4fb0-aad4-566afd725d1b'

test.use({ launchOptions: { args: [`--host-resolver-rules=MAP ${HOSTNAME} 127.0.0.1`] } })

test.skip(!LOGIN_ON, 'the login switch is off in this build')
test.skip(Boolean(process.env.PLAYWRIGHT_BASE_URL), 'BotID’s stand-in is for this machine only')

test.beforeEach(({ browserName, page }) => {
  test.skip(browserName !== 'chromium', 'slowing the CPU needs the Chrome DevTools Protocol')
  test.skip((page.viewportSize()?.width ?? 0) > 400, 'timed as on a phone')
})

/** The challenge script and the auth route, and the BotID answer each protected request carried. */
async function standInForVercel(page: Page) {
  const answers: string[] = []
  await page.route('**/a-4-a/c.js*', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: 'window.V_C.push({b:1,v:"stand-in",e:"stand-in",d:0})',
    }),
  )
  await page.route('**/api/auth/**', (route) => {
    answers.push(route.request().headers()['x-is-human'] ?? '')
    return route.fulfill({ status: 200, json: { success: true } })
  })
  return answers
}

/** Every script the page loads from the site from now on, as text. */
function collectScripts(page: Page): Promise<string>[] {
  const scripts: Promise<string>[] = []
  page.on('response', (response) => {
    if (response.url().startsWith(SITE) && /\.js(\?|$)/.test(response.url())) {
      // A script still arriving as the test ends has nothing to add.
      scripts.push(response.text().catch(() => ''))
    }
  })
  return scripts
}

const holdsBotId = (script: string) => script.includes(BOTID_MARK)

test(`asking for a code answers within ${BUDGET} ms on a slow phone, with BotID running`, async ({
  page,
}) => {
  await recordEventTimings(page)
  const answers = await standInForVercel(page)
  const { quickest, visits } = await visitLatency(BUDGET, async () => {
    await openOnSlowPhone(page, `${SITE}/sign-up/`)
    await page.getByLabel('Your name').fill('Asha Rao')
    await page.getByLabel('Your email').fill('asha@example.test')
    await page.getByRole('checkbox', { name: /18 or over/ }).check()
    await waitForBotCheck(page)
    const asking = await latencyOf(page, () =>
      page.getByRole('button', { name: 'Email me a code' }).click(),
    )
    await expect(page.getByRole('heading', { name: 'Enter your emailed code' })).toBeVisible()
    return [asking]
  })
  expect(answers.length, 'BotID saw the request').toBeGreaterThan(0)
  for (const answer of answers) expect(answer).toContain('stand-in')
  expect(quickest, `visits: ${visits.join(', ')} ms`).toBeLessThan(BUDGET)
})

test('BotID’s script is on the login pages alone, and adds little to them', async ({ page }) => {
  const scripts = collectScripts(page)
  await gotoReady(page, `${SITE}/`)
  // A page's links prefetch their next pages at idle: BotID must not come along with those either.
  await page.waitForLoadState('networkidle')
  expect((await Promise.all(scripts)).some(holdsBotId)).toBe(false)

  scripts.length = 0
  await gotoReady(page, `${SITE}/sign-up/`)
  await expect
    .poll(async () => (await Promise.all(scripts)).filter(holdsBotId).length, {
      message: 'BotID’s chunk has loaded',
    })
    .toBe(1)
  const [botId = ''] = (await Promise.all(scripts)).filter(holdsBotId)
  expect(Buffer.byteLength(botId), 'BotID’s bytes on /sign-up/').toBeLessThan(BOTID_SCRIPT_BUDGET)
})
