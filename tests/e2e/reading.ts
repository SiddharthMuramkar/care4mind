import type { Page } from '@playwright/test'

/** The long reading pages that carry a reading thread. */
export const READING_PAGES = [
  { path: '/concepts/vikshepa', name: 'Concept page' },
  { path: '/questionnaires/karmayoga-scale', name: 'Questionnaire page' },
] as const

export interface Thread {
  left: number
  /** How far across the screen it reaches, in px: 0 before you start reading. */
  width: number
  height: number
  screenWidth: number
  /** Hidden from assistive technology. */
  silent: boolean
  /** A press on it lands on whatever is beneath. */
  passesPressesThrough: boolean
}

/** The reading thread: a thin line pinned across the top of the screen, or null when there is none. */
export function readingThread(page: Page): Promise<Thread | null> {
  return page.evaluate(() => {
    const thread = [...document.querySelectorAll('body *')].find((element) => {
      const box = element.getBoundingClientRect()
      if (Math.abs(box.top) >= 0.5 || box.height === 0 || box.height > 8) return false
      return element.getClientRects().length > 0 && getComputedStyle(element).position === 'fixed'
    })
    if (!thread) return null
    const box = thread.getBoundingClientRect()
    const beneath = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
    return {
      left: box.left,
      width: box.width,
      height: box.height,
      screenWidth: document.documentElement.clientWidth,
      silent: thread.closest('[aria-hidden="true"]') !== null,
      passesPressesThrough: beneath !== null && !thread.contains(beneath),
    }
  })
}

/** Scroll at once to this fraction of the way down the page (0 the top, 1 the foot). */
export async function readTo(page: Page, fraction: number) {
  await page.evaluate((fraction) => {
    const end = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: end * fraction, behavior: 'instant' })
  }, fraction)
  // Scroll-driven animations catch up on the next frame.
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  )
}
