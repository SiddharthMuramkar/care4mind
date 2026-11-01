import type { Locator, Page } from '@playwright/test'

import { hrefFor } from '@/content'

import { expect, gotoReady, test } from './fixtures'

// Windows' contrast themes repaint backgrounds and borders in system colours and drop every
// box-shadow, so a state or an edge drawn only with those has to be drawn again.
test.use({ forcedColors: 'active' })

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

/** An edge the theme can see: a border wider than 0 in a colour that isn't transparent. */
async function expectVisibleEdge(locator: Locator, what: string) {
  const edge = await locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return { width: parseFloat(style.borderTopWidth), color: style.borderTopColor }
  })
  expect(edge.width, `${what}: border width`).toBeGreaterThan(0)
  expect(edge.color, `${what}: border colour`).not.toMatch(
    /^transparent$|^rgba\(.*,\s*0\)$|\/\s*0\)$/,
  )
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

test('the home page’s secondary call to action keeps its edge', async ({ page }) => {
  await gotoReady(page, '/')
  await expectVisibleEdge(
    page.getByRole('main').getByRole('link', { name: 'Questionnaires', exact: true }),
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

test('the Menu Drawer keeps its edge', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await gotoReady(page, '/concepts/vikshepa/')
  await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click()
  const drawer = page.getByRole('dialog', { name: 'Menu' })
  await expect(drawer).toBeVisible()
  await expectVisibleEdge(drawer, 'Menu Drawer')
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
