import type { Page } from '@playwright/test'

/**
 * Lines in decorative drawings that are not fully drawn. Lines a scroll
 * timeline is drawing are left out: they finish as the visitor scrolls.
 */
export function unfinishedDrawings(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('svg[aria-hidden="true"] path')]
      .filter((line) =>
        line.getAnimations().every((animation) => animation.timeline instanceof DocumentTimeline),
      )
      .filter((line) => parseFloat(getComputedStyle(line).strokeDashoffset) !== 0)
      .map((line) => line.outerHTML.slice(0, 80)),
  )
}
