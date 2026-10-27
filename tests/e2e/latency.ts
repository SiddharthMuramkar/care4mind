import { type CDPSession, expect, type Page } from '@playwright/test'

interface Timing {
  interactionId: number
  /** From the press until the next frame is shown, in ms: what INP is made of. */
  duration: number
}

/**
 * Note how long each press takes to answer, with the Event Timing API. It
 * reports only events of 16 ms or more, which every press that paints takes
 * on a slowed CPU. Call before loading the page.
 */
export function recordEventTimings(page: Page) {
  return page.addInitScript(() => {
    const timings: Timing[] = []
    Object.defineProperty(window, '__eventTimings', { value: timings })
    // TypeScript's DOM types don't list the Event Timing option yet.
    const options: PerformanceObserverInit & { durationThreshold: number } = {
      type: 'event',
      durationThreshold: 16,
      buffered: true,
    }
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEventTiming[]) {
        if (entry.interactionId) {
          timings.push({ interactionId: entry.interactionId, duration: entry.duration })
        }
      }
    }).observe(options)
  })
}

// One DevTools session per page: closing it would undo the slowdown.
const sessions = new WeakMap<Page, CDPSession>()

/** Run the page's CPU this many times slower. Chromium only. */
async function cpuSlowdown(page: Page, rate: number) {
  const session = sessions.get(page) ?? (await page.context().newCDPSession(page))
  sessions.set(page, session)
  await session.send('Emulation.setCPUThrottlingRate', { rate })
}

/**
 * Open a page at full speed and let it start up (loaded, hydrated and with
 * nothing left to run), then slow its CPU four times, as Lighthouse does to
 * stand in for a mid-range phone.
 */
export async function openOnSlowPhone(page: Page, path: string) {
  await cpuSlowdown(page, 1)
  await page.goto(path)
  await page.evaluate(() => new Promise((done) => requestIdleCallback(done, { timeout: 5000 })))
  await cpuSlowdown(page, 4)
}

const timings = (page: Page, after: number) =>
  page.evaluate(
    (after) =>
      (window as unknown as { __eventTimings: Timing[] }).__eventTimings
        .filter(({ interactionId }) => interactionId > after)
        .map(({ duration }) => duration),
    after,
  )

/**
 * How long the page takes to answer a press, in ms: its longest event, from
 * the press until the frame that shows the answer. Call recordEventTimings
 * before loading the page.
 */
export async function latencyOf(page: Page, press: () => Promise<void>): Promise<number> {
  const before = await page.evaluate(() =>
    Math.max(
      0,
      ...(window as unknown as { __eventTimings: Timing[] }).__eventTimings.map(
        ({ interactionId }) => interactionId,
      ),
    ),
  )
  await press()
  await expect
    .poll(async () => (await timings(page, before)).length, { message: 'the press is timed' })
    .toBeGreaterThan(0)
  // A press's events can be reported a frame or two apart.
  await page.evaluate(
    () =>
      new Promise((done) =>
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 50))),
      ),
  )
  return Math.max(...(await timings(page, before)))
}

/**
 * A visit's latency, in ms: its slowest press, as INP counts it. Other tests
 * sharing the machine can only add time, so a visit that comes in over
 * `budget` is tried again from a fresh load, up to three times in all, and the
 * quickest counts. A page that is slow itself is slow on every visit.
 */
export async function visitLatency(budget: number, visit: () => Promise<number[]>) {
  const visits: number[] = []
  while (visits.length < 3 && !visits.some((latency) => latency < budget)) {
    visits.push(Math.max(...(await visit())))
  }
  return { quickest: Math.min(...visits), visits }
}
