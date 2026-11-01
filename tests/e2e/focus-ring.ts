import type { Locator, Page } from '@playwright/test'

import { contrastRatio } from '@/lib/contrast'

import { expect } from './fixtures'

/** Press Tab until `target` has focus, as a keyboard user would. */
async function tabTo(page: Page, target: Locator) {
  for (let presses = 0; presses < 120; presses += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return
    await page.keyboard.press('Tab')
  }
  await expect(target).toBeFocused()
}

/** `#rrggbb` from three channels. */
function hex(channels: readonly number[]): string {
  return `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`
}

/** Channels of a computed `rgb()` or `rgba()` colour. */
function channelsOf(color: string): [number, number, number] {
  const match = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(color)
  if (!match) throw new Error(`expected an rgb colour, got ${color}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

/** The colour of one CSS pixel. */
async function pixel(page: Page, x: number, y: number): Promise<[number, number, number]> {
  const png = (
    await page.screenshot({
      scale: 'css',
      clip: { x: Math.floor(x), y: Math.floor(y), width: 1, height: 1 },
    })
  ).toString('base64')
  return page.evaluate(async (encoded) => {
    const image = new Image()
    image.src = `data:image/png;base64,${encoded}`
    await image.decode()
    const canvas = new OffscreenCanvas(image.width, image.height)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('no canvas')
    context.drawImage(image, 0, 0)
    const data = context.getImageData(0, 0, 1, 1).data
    return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0]
  }, png)
}

/**
 * Contrast between a card action's focus ring and the colour painted behind it.
 * Tabs to the link, so the ring is the one a keyboard user sees.
 */
export async function focusRingContrast(page: Page, link: Locator): Promise<number> {
  // The page scrolls smoothly. An instant correction would race that scroll and land on the header.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto'
  })
  await page.evaluate(() => document.fonts.ready)
  await tabTo(page, link)
  expect(await link.evaluate((element) => element.matches(':focus-visible'))).toBe(true)

  const spot = await link.evaluate((element) => {
    const card = element.closest('article')
    if (!card) throw new Error('the action sits on a card')
    const style = getComputedStyle(element, '::after')
    const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
    // A positioned link keeps the stretched ::after on itself; otherwise the ::after covers the card.
    const boxOf = () => {
      const linkBox = element.getBoundingClientRect()
      const cardBox = card.getBoundingClientRect()
      const stretched = Number.parseFloat(style.width)
      return Math.abs(stretched - linkBox.width) < 2 ? linkBox : cardBox
    }
    window.scrollBy({ top: boxOf().top - header - 24, behavior: 'instant' })
    const box = boxOf()
    const width = Number.parseFloat(style.outlineWidth)
    const offset = Number.parseFloat(style.outlineOffset)
    // Inner edge is `offset` from the border (positive sits outside); the stroke runs outward by its width.
    const outset = offset + width / 2
    return {
      color: style.outlineColor,
      style: style.outlineStyle,
      header,
      x: box.left + box.width / 2,
      y: box.top - outset,
    }
  })

  const viewport = page.viewportSize()?.height ?? 0
  expect(spot.y, 'the ring is on screen, below the header').toBeGreaterThan(spot.header)
  expect(spot.y).toBeLessThan(viewport)
  expect(spot.style, 'the card draws a solid ring').toBe('solid')

  const ring = channelsOf(spot.color)
  const painted = await pixel(page, spot.x, spot.y)
  const offRing = ring.some((channel, index) => Math.abs(channel - (painted[index] ?? 0)) > 12)
  expect(offRing, `the sample should be the ring ${spot.color}, not ${hex(painted)}`).toBe(false)

  await link.evaluate((element) => element.blur())
  const behind = await pixel(page, spot.x, spot.y)
  return contrastRatio(hex(ring), hex(behind))
}
