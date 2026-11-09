import type { Locator, Page } from '@playwright/test'

import { hrefFor } from '@/content'

import { gotoErrorPage } from './error-page'
import { expect, gotoReady, test } from './fixtures'
import { LOGGED_IN } from './login'
import { MISSING } from './routes'

// Windows' contrast themes repaint backgrounds and borders in system colours and drop every
// box-shadow, so a state or an edge drawn only with those has to be drawn again.
test.use({ forcedColors: 'active' })
test.use({ storageState: LOGGED_IN })

const FLOW = '/questionnaires/karmayoga-scale/take/'

/**
 * What tells one control from another once colours are forced: its outline, its border's width,
 * and the background it shows, read through to the nearest painted ancestor.
 */
const seen = (control: Locator) =>
  control.evaluate((element) => {
    const style = getComputedStyle(element)
    const painted = (color: string) =>
      color !== 'transparent' && !/^rgba\(.*,\s*0\)$|\/\s*0\)$/.test(color)
    let shown = style.backgroundColor
    for (let at = element.parentElement; !painted(shown) && at; at = at.parentElement) {
      shown = getComputedStyle(at).backgroundColor
    }
    return {
      outline:
        style.outlineStyle === 'none' ? 'none' : `${style.outlineWidth} ${style.outlineStyle}`,
      border: style.borderTopWidth,
      background: shown,
    }
  })

const TRANSPARENT = /^transparent$|^rgba\(.*,\s*0\)$|\/\s*0\)$/

/** An edge the theme can see: a border wider than 0 in a colour that isn't transparent. */
async function expectVisibleEdge(locator: Locator, what: string) {
  const edge = await locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return { width: parseFloat(style.borderTopWidth), color: style.borderTopColor }
  })
  expect(edge.width, `${what}: border width`).toBeGreaterThan(0)
  expect(edge.color, `${what}: border colour`).not.toMatch(TRANSPARENT)
}

const optionOf = (radio: Locator) => radio.locator('xpath=ancestor::label[1]')

test('a chosen answer stands apart from the others', async ({ page }) => {
  await gotoReady(page, FLOW)
  const radios = page.getByRole('radiogroup').first().getByRole('radio')
  await radios.nth(1).check()
  // Without focus, so its ring can't stand in for the chosen state.
  await radios.nth(1).blur()
  expect(await seen(optionOf(radios.nth(1)))).not.toEqual(await seen(optionOf(radios.nth(2))))
})

test('a pressed A–Z chip stands apart from the others', async ({ page }) => {
  await gotoReady(page, hrefFor({ page: 'concepts' }))
  const chips = page.getByRole('group', { name: 'Filter the entries' }).getByRole('button')
  await chips.nth(1).click()
  await expect(chips.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await chips.nth(1).blur()
  expect(await seen(chips.nth(1))).not.toEqual(await seen(chips.nth(2)))
})

test('a pressed map chip stands apart from the others', async ({ page }) => {
  await gotoReady(page, hrefFor({ page: 'concept-map' }))
  await expect(page.locator('[data-map] [role="group"][data-orientation]')).toHaveCount(2)
  const lines = page.getByRole('group', { name: 'Lines' }).getByRole('button')
  await lines.nth(1).click()
  await expect(lines.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await lines.nth(1).blur()
  expect(await seen(lines.nth(1))).not.toEqual(await seen(lines.nth(2)))
})

test('a section page keeps its Sticker', async ({ page }) => {
  await gotoReady(page, hrefFor({ page: 'concepts' }))
  const sticker = page.getByRole('main').locator('header img')
  await expect(sticker).toBeVisible()
  await expect
    .poll(() => sticker.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('a Concept page keeps its picture', async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'concept', id: 'vikshepa' }))
  const picture = page.getByRole('main').locator('header img')
  await expect(picture).toBeVisible()
  await expect(picture).toHaveAttribute('alt', '')
  await expect
    .poll(() => picture.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('a Traditional text page keeps its head picture, decorative', async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'work', id: 'yoga-sutra' }))
  const picture = page.getByRole('main').locator('header img')
  await expect(picture).toBeVisible()
  await expect(picture).toHaveAttribute('alt', '')
  await expect
    .poll(() => picture.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0)
})

test('a Traditional text card keeps its edge', async ({ page }) => {
  await gotoReady(page, hrefFor({ page: 'texts' }))
  await expectVisibleEdge(page.getByRole('main').getByRole('article').first(), 'text card')
})

test('a secondary call to action keeps its edge', async ({ page }) => {
  await gotoReady(page, FLOW)
  await expectVisibleEdge(
    page.getByRole('main').getByRole('link', { name: 'Back to its purpose and limits' }),
    'secondary call to action',
  )
})

test('the Retake dialog keeps its edge', async ({ page }) => {
  await gotoReady(page, FLOW)
  await answerEverything(page)
  await page.getByRole('button', { name: 'Retake' }).click()
  const dialog = page.getByRole('alertdialog', { name: 'Start again?' })
  await expect(dialog).toBeVisible()
  await expectVisibleEdge(dialog, 'Retake dialog')
})

test('the Menu Drawer keeps its edge', { tag: '@self-width' }, async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await gotoReady(page, '/concepts/vikshepa/')
  await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click()
  const drawer = page.getByRole('dialog', { name: 'Menu' })
  await expect(drawer).toBeVisible()
  await expectVisibleEdge(drawer, 'Menu Drawer')
})

test('a Frontispiece ring draws in the text colour of the theme', async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const header = page.getByRole('main').locator('header')
  const paths = header.locator('span:has(> img) > svg path')
  expect(await paths.count()).toBeGreaterThan(0)
  // What CanvasText resolves to in this theme, read through a probe set inside the header.
  const text = await header.evaluate((element) => {
    const probe = document.createElement('i')
    probe.style.color = 'CanvasText'
    element.append(probe)
    const colour = getComputedStyle(probe).color
    probe.remove()
    return colour
  })
  expect(text).not.toMatch(TRANSPARENT)
  for (const path of await paths.all()) {
    expect(await path.evaluate((element) => getComputedStyle(element).stroke)).toBe(text)
  }
})

/** A picture's box stands even if its file failed, so what counts is that the file arrived. */
const expectLoaded = (picture: Locator) =>
  expect
    .poll(() => picture.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0)

test('the 404 page keeps its picture and its Fleuron', async ({ page }) => {
  await gotoReady(page, MISSING)
  const main = page.getByRole('main')
  await expect(main.locator('img')).toBeVisible()
  const fleuron = main.locator('svg[data-lotus]')
  await expect(fleuron).toBeVisible()
  const stroke = await fleuron
    .locator('path')
    .first()
    .evaluate((path) => getComputedStyle(path).stroke)
  expect(stroke).not.toMatch(/^none$|^transparent$|^rgba\(.*,\s*0\)$/)
})

test('the footer keeps its Emblem and motto', async ({ page }) => {
  await gotoReady(page, '/concepts/vikshepa/')
  const footer = page.getByRole('contentinfo')
  const emblem = footer.locator('img')
  // It loads lazily, so it has to come near the screen.
  await emblem.scrollIntoViewIfNeeded()
  await expect(emblem).toBeVisible()
  await expectLoaded(emblem)
  await expect(footer.locator('[lang="sa-Deva"]')).toBeVisible()
})

test('the error pages keep their Emblem and the edge of their button', async ({ page }) => {
  const emblem = page.getByRole('main').locator('img')
  await gotoErrorPage(page, 'segment')
  await expect(emblem).toBeVisible()
  await expectLoaded(emblem)
  await expectVisibleEdge(page.getByRole('button', { name: 'Try again' }), 'Try again')
  await page.unrouteAll()
  await gotoErrorPage(page, 'global')
  await expect(emblem).toBeVisible()
  await expectLoaded(emblem)
  await expectVisibleEdge(page.getByRole('button', { name: 'Reload the page' }), 'Reload the page')
})

test('the KarmaYoga Scale page keeps its Medallion and its cycle in the theme’s text colour', async ({
  page,
}) => {
  await gotoReady(page, '/questionnaires/karmayoga-scale/')
  const picture = page.getByRole('main').locator('header img')
  await expect(picture).toBeVisible()
  await expect(picture).toHaveAttribute('alt', '')
  await expect
    .poll(() => picture.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0)
  const ring = page.getByRole('main').locator('header span:has(> img) > svg path')
  expect(await ring.count(), 'the ring has paths').toBeGreaterThan(0)
  for (const path of await ring.all()) {
    const { stroke, color } = await path.evaluate((element) => ({
      stroke: getComputedStyle(element).stroke,
      color: getComputedStyle(element.parentElement as Element).color,
    }))
    expect(stroke).toBe(color)
    expect(stroke).not.toMatch(/^transparent$|^rgba\(.*,\s*0\)$/)
  }
  const seenIn = (selector: string, property: 'fill' | 'stroke') =>
    page
      .locator(`#karma-cycle svg ${selector}`)
      .evaluateAll(
        (parts, property) => parts.map((part) => getComputedStyle(part)[property]),
        property,
      )
  const text = await page
    .locator('#karma-cycle')
    .evaluate((figure) => getComputedStyle(figure).color)
  const arrows = await seenIn('path', 'stroke')
  const strikes = await seenIn('line', 'stroke')
  const words = await seenIn('text', 'fill')
  expect(arrows.length).toBeGreaterThan(0)
  expect(strikes).toHaveLength(3)
  expect(words.length).toBeGreaterThan(0)
  for (const colour of [...arrows, ...strikes, ...words]) expect(colour).toBe(text)
})

test('the hero Medallion ring draws in the text colour of the theme', async ({ page }) => {
  await gotoReady(page, '/')
  const paths = page.locator('figure:has([data-hero-plate]) svg path')
  expect(await paths.count()).toBeGreaterThan(0)
  for (const path of await paths.all()) {
    const { stroke, color } = await path.evaluate((element) => ({
      stroke: getComputedStyle(element).stroke,
      color: getComputedStyle(element.parentElement as Element).color,
    }))
    expect(stroke).toBe(color)
    expect(stroke).not.toMatch(/^transparent$|^rgba\(.*,\s*0\)$/)
  }
})

test("the Plate viewer's buttons keep their edges and their arrows", async ({ page }) => {
  await gotoReady(page, '/')
  const group = page.getByRole('group', { name: 'Paintings' })
  for (const name of ['Previous painting', 'Next painting']) {
    const button = group.getByRole('button', { name, exact: true })
    await expectVisibleEdge(button, name)
    const stroke = await button.locator('svg').evaluate((glyph) => getComputedStyle(glyph).stroke)
    expect(stroke, `${name}: arrow`).not.toMatch(/^none$|^transparent$|^rgba\(.*,\s*0\)$/)
  }
})

const PARTS = [
  'Everyday Experience - 1',
  'Everyday Experience - 2',
  'Experience Related to Work - 1',
  'Experience Related to Work - 2',
]

/** Answer every part with each statement's first option, then finish. */
async function answerEverything(page: Page) {
  for (const title of PARTS) {
    await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible()
    const groups = page.getByRole('radiogroup')
    const count = await groups.count()
    for (let position = 0; position < count; position++) {
      await groups.nth(position).getByRole('radio').first().check()
    }
    await page.getByRole('button', { name: 'Next', exact: true }).click()
  }
  await expect(page.getByRole('heading', { level: 2, name: 'Review your answers' })).toBeVisible()
  await page.getByRole('button', { name: 'Finish' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Your result' })).toBeVisible()
}
