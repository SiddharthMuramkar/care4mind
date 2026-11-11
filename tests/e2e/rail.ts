import type { Locator, Page } from '@playwright/test'

import { expect } from './fixtures'

// The A–Z's letter rail as a reader meets it on a phone: one row that scrolls sideways.

/** The letters lying wholly inside the row's box, links or not. */
export function lettersInView(row: Locator): Promise<string[]> {
  return row.evaluate((rail) => {
    const { left, right } = rail.getBoundingClientRect()
    return [...rail.children]
      .filter((letter) => {
        const box = letter.getBoundingClientRect()
        return box.left >= left - 0.5 && box.right <= right + 0.5
      })
      .map((letter) => letter.textContent ?? '')
  })
}

/**
 * Turn the wheel sideways over the row until it reaches its far end, as a swipe scrolls it (a
 * wheel, not scrollBy: a script can scroll a row that hides its overflow, a reader can't).
 * Every letter seen wholly on the way.
 */
export async function swipeAcross(page: Page, row: Locator): Promise<string[]> {
  await row.hover()
  const seen = new Set(await lettersInView(row))
  const at = () => row.evaluate((rail) => rail.scrollLeft)
  const atEnd = () =>
    row.evaluate((rail) => rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1)
  for (let turn = 0; turn < 60 && !(await atEnd()); turn += 1) {
    const before = await at()
    await page.mouse.wheel(100, 0)
    await expect.poll(at, 'the wheel scrolls the row').toBeGreaterThan(before)
    for (const letter of await lettersInView(row)) seen.add(letter)
  }
  return [...seen]
}

/**
 * Give the row's first link focus, then press the right arrow along it: each linked letter in
 * turn, and whether it stood wholly in view as it took focus.
 */
export async function arrowAcross(page: Page, row: Locator) {
  const links = row.getByRole('link')
  const names = await links.allTextContents()
  await links.first().focus()
  const reached: { letter: string; inView: boolean }[] = []
  for (const step of names.keys()) {
    if (step > 0) await page.keyboard.press('ArrowRight')
    reached.push(
      await row.evaluate((rail) => {
        const focused = document.activeElement
        if (!(focused instanceof HTMLElement) || !rail.contains(focused))
          return { letter: '', inView: false }
        const [box, letter] = [rail.getBoundingClientRect(), focused.getBoundingClientRect()]
        return {
          letter: focused.textContent ?? '',
          inView: letter.left >= box.left - 0.5 && letter.right <= box.right + 0.5,
        }
      }),
    )
  }
  return { names, reached }
}

/** Which ends of the row fade, and the mask that fades them. */
export function fades(row: Locator) {
  return row.evaluate((rail) => {
    const style = getComputedStyle(rail)
    const fading = (end: string) => style.getPropertyValue(`--fade-${end}`).trim() !== '0%'
    return { start: fading('start'), end: fading('end'), mask: style.maskImage }
  })
}

/** Each letter's box, rounded to the pixel: one row has one top. */
export function letterBoxes(row: Locator) {
  return row.locator(':scope > *').evaluateAll((letters) =>
    letters.map((letter) => {
      const { top, width, height } = letter.getBoundingClientRect()
      return { top: Math.round(top), width, height }
    }),
  )
}
