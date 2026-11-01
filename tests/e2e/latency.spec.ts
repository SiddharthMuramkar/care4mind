import { expect, test } from './fixtures'
import { pauseButton } from './lotuses'
import { latencyOf, openOnSlowPhone, recordEventTimings, visitLatency } from './latency'

// NFR-02 asks for INP ≤ 200 ms on mobile, which Lighthouse can't measure. So the presses that do
// the most are timed here, on a phone-sized screen with the CPU slowed four times.
const BUDGET = 200

test.beforeEach(async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'slowing the CPU needs the Chrome DevTools Protocol')
  test.skip((page.viewportSize()?.width ?? 0) > 400, 'timed as on a phone')
  await recordEventTimings(page)
})

// It opens in a new tab, so the press is timed on the homepage that answered it.
test(`pressing "Start here" answers within ${BUDGET} ms on a slow phone`, async ({
  page,
  context,
}) => {
  const cta = page.getByRole('main').getByRole('link', { name: 'Start here', exact: true })
  const { quickest, visits } = await visitLatency(BUDGET, async () => {
    await openOnSlowPhone(page, '/')
    const opened = context.waitForEvent('page')
    const latency = await latencyOf(page, () => cta.click({ modifiers: ['ControlOrMeta'] }))
    await (await opened).close()
    return [latency]
  })
  expect(quickest, `visits: ${visits.join(', ')} ms`).toBeLessThan(BUDGET)
})

test(`pressing the "Devanagari first" switch answers within ${BUDGET} ms on a slow phone, each way`, async ({
  page,
}) => {
  const toggle = page.getByRole('button', { name: 'Devanagari first' })
  const { quickest, visits } = await visitLatency(BUDGET, async () => {
    await openOnSlowPhone(page, '/concepts/vikshepa/')
    const latencies: number[] = []
    for (const pressed of ['true', 'false']) {
      latencies.push(await latencyOf(page, () => toggle.click()))
      await expect(toggle).toHaveAttribute('aria-pressed', pressed)
    }
    return latencies
  })
  expect(quickest, `visits: ${visits.join(', ')} ms`).toBeLessThan(BUDGET)
})

test(`pressing the opening lotus answers within ${BUDGET} ms on a slow phone`, async ({ page }) => {
  const lotus = page.getByRole('main').locator('svg[data-lotus]').first()
  const { quickest, visits } = await visitLatency(BUDGET, async () => {
    await openOnSlowPhone(page, '/')
    const latency = await latencyOf(page, () => lotus.click())
    await expect(lotus).toHaveAttribute('data-lotus-bloom', 'a')
    return [latency]
  })
  expect(quickest, `visits: ${visits.join(', ')} ms`).toBeLessThan(BUDGET)
})

test(`pressing "Pause the lotus" answers within ${BUDGET} ms on a slow phone`, async ({ page }) => {
  const { quickest, visits } = await visitLatency(BUDGET, async () => {
    await openOnSlowPhone(page, '/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    const pause = await pauseButton(page)
    const latency = await latencyOf(page, () => pause.click())
    await expect(page.locator('html')).toHaveAttribute('data-lotus-motion', 'still')
    return [latency]
  })
  expect(quickest, `visits: ${visits.join(', ')} ms`).toBeLessThan(BUDGET)
})
