import type { Locator, Page } from '@playwright/test'

import { expect, gotoReady, test } from './fixtures'

// Windows contrast themes drop backgrounds and shadows. A chosen answer, a pressed chip
// and a popup edge each have to stay visible (forced-colors).

test.use({ forcedColors: 'active' })

const FLOW = '/questionnaires/karmayoga-scale/take/'

/** Outline, border width and background: the three a contrast theme can still show. */
function marks(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      outline: `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`,
      borderWidth: style.borderTopWidth,
      background: style.backgroundColor,
    }
  })
}

function blur(page: Page) {
  return page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  })
}

/** A real colour: the transparent keyword, or any colour whose alpha is 0, is not one. */
function isPainted(color: string) {
  if (color === 'transparent') return false
  const alpha = /rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/.exec(color)
  return alpha === null || Number(alpha[1]) > 0
}

/** The edge forced colours paint: a border wider than nothing, in a painted colour. */
async function expectPaintedBorder(locator: Locator) {
  const border = await locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return { width: style.borderTopWidth, color: style.borderTopColor }
  })
  expect(Number.parseFloat(border.width)).toBeGreaterThan(0)
  expect(isPainted(border.color), border.color).toBe(true)
}

test('a chosen answer and a pressed chip stand apart from an unpressed sibling', async ({
  page,
}) => {
  await gotoReady(page, FLOW)
  const group = page.getByRole('radiogroup').first()
  const chosen = group.getByRole('radio').first()
  const other = group.getByRole('radio').nth(1)
  await chosen.check()
  await blur(page)
  expect(await marks(chosen.locator('..'))).not.toEqual(await marks(other.locator('..')))

  await gotoReady(page, '/concepts/')
  const filters = page.getByRole('group', { name: 'Filter the entries' }).getByRole('button')
  await filters.nth(0).click()
  await expect(filters.nth(0)).toHaveAttribute('aria-pressed', 'true')
  await expect(filters.nth(1)).toHaveAttribute('aria-pressed', 'false')
  await blur(page)
  expect(await marks(filters.nth(0))).not.toEqual(await marks(filters.nth(1)))

  await gotoReady(page, '/concepts/map/')
  const lines = page.getByRole('group', { name: 'Lines' })
  const pressed = lines.getByRole('button', { name: 'Shared verse' })
  const resting = lines.getByRole('button', { name: 'Shared text' })
  await pressed.click()
  await expect(pressed).toHaveAttribute('aria-pressed', 'true')
  await expect(resting).toHaveAttribute('aria-pressed', 'false')
  await blur(page)
  expect(await marks(pressed)).not.toEqual(await marks(resting))
})

test('the Menu drawer and the home secondary action keep a painted edge', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await gotoReady(page, '/')
  await expectPaintedBorder(page.locator('a[href="#questionnaires"]'))
  await page.getByRole('banner').getByRole('button', { name: 'Menu', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: 'Menu' })
  await expect(drawer).toBeVisible()
  await expectPaintedBorder(drawer)
})

const PARTS = [
  'Everyday Experience - 1',
  'Everyday Experience - 2',
  'Experience Related to Work - 1',
  'Experience Related to Work - 2',
] as const

test('the Retake dialog keeps a painted edge', async ({ page }) => {
  await gotoReady(page, FLOW)
  for (const title of PARTS) {
    // Wait for this part, so the previous part's radios are gone before they are counted.
    await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible()
    const groups = page.getByRole('radiogroup')
    await expect(groups.first()).toBeVisible()
    const count = await groups.count()
    for (let position = 0; position < count; position++) {
      await groups.nth(position).getByRole('radio').first().check()
    }
    await page.getByRole('button', { name: 'Next', exact: true }).click()
  }
  await expect(page.getByRole('heading', { level: 2, name: 'Review your answers' })).toBeVisible()
  await page.getByRole('button', { name: 'Finish' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Your result' })).toBeVisible()
  await page.getByRole('button', { name: 'Retake' }).click()
  const dialog = page.getByRole('alertdialog', { name: 'Start again?' })
  await expect(dialog).toBeVisible()
  await expectPaintedBorder(dialog)
})
