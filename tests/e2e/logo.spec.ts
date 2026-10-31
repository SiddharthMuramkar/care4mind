import type { Locator, Page } from '@playwright/test'

import { recordAnimationStarts } from './drawings'
import { expect, gotoReady, test } from './fixtures'
import { MISSING, PAGES } from './routes'

const homeLink = (page: Page) =>
  page.getByRole('banner').getByRole('link', { name: 'Care4Mind home', exact: true })

const footerWordmark = (page: Page) =>
  page.getByRole('contentinfo').getByText('Care4Mind', { exact: true })

const LOTUS = 'svg[data-lotus]'

/** Line art or pictures: anything drawn beyond the lotus, the type and the 4's roundel. */
const LINE_ART = `:is(path, line, polyline, polygon, img, canvas):not(${LOTUS} *)`

/** Animations on the element or anything inside it, running or finished, since the page began. */
const animationsIn = (element: Locator) =>
  element.evaluate((node) => node.getAnimations({ subtree: true }).length)

/** Animations on the element or anything inside it, leaving out the lotus and its parts. */
const animationsBesideTheLotus = (element: Locator) =>
  element.evaluate(
    (node) =>
      node.getAnimations({ subtree: true }).filter((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target
        return !target?.closest('svg[data-lotus]')
      }).length,
  )

for (const { path, name } of [...PAGES, { path: MISSING, name: '404 page' }]) {
  test(`${name} shows the lotus and the wordmark, named "Care4Mind home"`, async ({ page }) => {
    await gotoReady(page, path)
    const logo = homeLink(page)
    await expect(logo).toBeVisible()
    const lotus = logo.locator(LOTUS)
    await expect(lotus).toHaveCount(1)
    await expect(lotus).toHaveAttribute('aria-hidden', 'true')
    await expect(lotus).toHaveAttribute('focusable', 'false')
    const [mark, wordmark] = await Promise.all([
      lotus.boundingBox(),
      logo.getByText('Care4Mind', { exact: true }).boundingBox(),
    ])
    expect(
      (mark?.x ?? Infinity) + (mark?.width ?? 0),
      'the lotus is left of the wordmark',
    ).toBeLessThanOrEqual(wordmark?.x ?? -Infinity)
    await expect(logo).toHaveText('Care4Mind')
    // The lotus, then type and its roundel: no other line drawing in it.
    await expect(logo.locator(LINE_ART)).toHaveCount(0)
    // WCAG 2.5.3: the visible "Care4Mind" is in the name, and the roundel adds nothing to what is announced.
    await expect(logo).toMatchAriaSnapshot(`
      - /children: deep-equal
      - link "Care4Mind home":
        - text: Care4Mind
    `)
  })
}

test('the logo is a target at least 48 px tall', async ({ page }) => {
  await gotoReady(page, '/')
  const box = await homeLink(page).boundingBox()
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(48)
})

test('the mark adds no stop of its own to the tab order', async ({ page }) => {
  await gotoReady(page, '/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(homeLink(page)).toBeFocused()
  await page.keyboard.press('Tab')
  // The header's next control: Concepts where the sections fit (from 72rem), else Search.
  const next = (page.viewportSize()?.width ?? 0) >= 1152 ? 'Concepts' : 'Search'
  const main = page.getByRole('navigation', { name: 'Main' })
  await expect(main.getByRole('link', { name: next, exact: true })).toBeFocused()
})

/**
 * The roundel behind the wordmark's 4, as drawn on screen: whether it is
 * vermilion, round, and has the white 4 at its centre. Read from a screenshot
 * round the figure, so it holds however the roundel is made.
 */
async function roundel(wordmark: Locator) {
  const four = wordmark.getByText('4', { exact: true })
  await four.scrollIntoViewIfNeeded()
  const box = await four.boundingBox()
  if (!box) throw new Error('the 4 must be on screen')
  const margin = 6
  const shot = await four.page().screenshot({
    scale: 'css',
    clip: {
      x: box.x - margin,
      y: box.y - margin,
      width: box.width + 2 * margin,
      height: box.height + 2 * margin,
    },
  })
  return four.page().evaluate(async (png) => {
    const image = new Image()
    image.src = `data:image/png;base64,${png}`
    await image.decode()
    const canvas = new OffscreenCanvas(image.width, image.height)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('no canvas')
    context.drawImage(image, 0, 0)
    const { data, width, height } = context.getImageData(0, 0, image.width, image.height)
    const pixel = (x: number, y: number) => {
      const [column, row] = [Math.round(x), Math.round(y)]
      if (column < 0 || column >= width || row < 0 || row >= height) return [0, 0, 0]
      const at = (row * width + column) * 4
      return [data[at] ?? 0, data[at + 1] ?? 0, data[at + 2] ?? 0]
    }
    // Vermilion is #c8342a in the Press palette; the 4 is white.
    const vermilion = (x: number, y: number) => {
      const [r = 0, g = 0, b = 0] = pixel(x, y)
      return Math.abs(r - 200) < 12 && Math.abs(g - 52) < 12 && Math.abs(b - 42) < 12
    }
    const white = (x: number, y: number) => pixel(x, y).every((channel) => channel > 225)
    const extent = (match: (x: number, y: number) => boolean) => {
      const found = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity }
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (!match(x, y)) continue
          found.left = Math.min(found.left, x)
          found.right = Math.max(found.right, x)
          found.top = Math.min(found.top, y)
          found.bottom = Math.max(found.bottom, y)
        }
      }
      return found
    }
    const disc = extent(vermilion)
    const centre = { x: (disc.left + disc.right) / 2, y: (disc.top + disc.bottom) / 2 }
    const radius = (disc.right - disc.left) / 2
    // How far the vermilion reaches from the centre in a direction: its outermost pixel that way.
    const reach = (dx: number, dy: number) => {
      let furthest = 0
      for (let step = 0; step < 2 * radius; step += 0.5) {
        if (vermilion(centre.x + dx * step, centre.y + dy * step)) furthest = step
      }
      return furthest
    }
    const straight = [reach(1, 0), reach(-1, 0), reach(0, 1), reach(0, -1)]
    const diagonal = [reach(1, 1), reach(1, -1), reach(-1, 1), reach(-1, -1)].map(
      (steps) => steps * Math.SQRT2,
    )
    const reaches = [...straight, ...diagonal]
    const inside = (x: number, y: number) =>
      Math.hypot(x - centre.x, y - centre.y) < radius * 0.9 && white(x, y)
    const figure = extent(inside)
    const figureCentre = {
      x: (figure.left + figure.right) / 2,
      y: (figure.top + figure.bottom) / 2,
    }
    return {
      vermilion: radius > 5,
      // A disc reaches as far every way; a square would reach 1.41 times as far on its diagonals.
      round: Math.max(...reaches) / Math.min(...reaches) < 1.15,
      holdsTheFigure:
        figure.right > figure.left &&
        Math.abs(figureCentre.x - centre.x) < radius * 0.2 &&
        Math.abs(figureCentre.y - centre.y) < radius * 0.2,
    }
  }, shot.toString('base64'))
}

const VERMILION_ROUNDEL = { vermilion: true, round: true, holdsTheFigure: true }

test("the wordmark's 4 sits in a vermilion roundel, in the header and the footer", async ({
  page,
}) => {
  await gotoReady(page, '/')
  expect(await roundel(homeLink(page))).toEqual(VERMILION_ROUNDEL)
  expect(await roundel(footerWordmark(page))).toEqual(VERMILION_ROUNDEL)
})

test('pointing at or focusing the logo animates nothing beside its breathing lotus', async ({
  page,
}) => {
  await recordAnimationStarts(page)
  await gotoReady(page, '/')
  const logo = homeLink(page)
  const startsOnTheLogo = async () =>
    await logo.evaluate(
      (link) =>
        (
          window as unknown as { __animationStarts: { target: Element }[] }
        ).__animationStarts.filter(({ target }) => link.contains(target)).length,
    )
  await logo.hover()
  // Pointing leans the lotus toward the pointer; only focus must start nothing more on it.
  await page.waitForTimeout(100)
  const before = await startsOnTheLogo()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(logo).toBeFocused()
  await page.waitForTimeout(100)
  expect(await animationsBesideTheLotus(logo), 'nothing outside the lotus animates').toBe(0)
  expect(await startsOnTheLogo(), 'focus starts nothing new on the lotus').toBe(before)
})

test('the footer shows the same wordmark, and pointing at it draws nothing', async ({ page }) => {
  await gotoReady(page, '/')
  const wordmark = footerWordmark(page)
  await expect(wordmark).toBeVisible()
  await expect(wordmark.locator(LINE_ART)).toHaveCount(0)
  await expect(
    wordmark.locator('..').locator(LOTUS),
    'the lotus is the header’s alone',
  ).toHaveCount(0)
  await wordmark.hover()
  await page.waitForTimeout(100)
  expect(await animationsIn(wordmark)).toBe(0)
})
