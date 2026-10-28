import { expect, test } from './fixtures'
import { latencyOf, openOnSlowPhone, recordEventTimings, visitLatency } from './latency'

// NFR-02 asks for INP ≤ 200 ms on mobile, which Lighthouse can't measure. So the presses that do
// the most are timed here, on a phone-sized screen with the CPU slowed four times.
const BUDGET = 200

test.beforeEach(async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'slowing the CPU needs the Chrome DevTools Protocol')
  test.skip((page.viewportSize()?.width ?? 0) > 400, 'timed as on a phone')
  await recordEventTimings(page)
})

test(`pressing "Explore Concepts" answers within ${BUDGET} ms on a slow phone`, async ({
  page,
}) => {
  const cta = page.getByRole('main').getByRole('link', { name: 'Explore Concepts', exact: true })
  const heading = page.getByRole('heading', { name: 'Concepts', level: 2 })
  const { quickest, visits } = await visitLatency(BUDGET, async () => {
    await openOnSlowPhone(page, '/')
    const latency = await latencyOf(page, () => cta.click())
    await expect(heading).toBeInViewport()
    return [latency]
  })
  expect(quickest, `visits: ${visits.join(', ')} ms`).toBeLessThan(BUDGET)
})

test(`pressing the "Devanagari first" switch answers within ${BUDGET} ms on a slow phone, each way`, async ({
  page,
}) => {
  const toggle = page.getByRole('button', { name: 'Devanagari first' })
  const { quickest, visits } = await visitLatency(BUDGET, async () => {
    await openOnSlowPhone(page, '/concepts/vikshepa')
    const latencies: number[] = []
    for (const pressed of ['true', 'false']) {
      latencies.push(await latencyOf(page, () => toggle.click()))
      await expect(toggle).toHaveAttribute('aria-pressed', pressed)
    }
    return latencies
  })
  expect(quickest, `visits: ${visits.join(', ')} ms`).toBeLessThan(BUDGET)
})
