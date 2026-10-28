import type { Locator, Page } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'
import { inPageTransitions, recordPageTurns } from './page-turns'
import { knobPath, recordScriptedAnimations } from './switches'

const heading = (page: Page) => page.getByRole('heading', { level: 1 })
const scriptSwitch = (page: Page) => page.getByRole('button', { name: 'Devanagari first' })

/** The scripts of the heading's spellings, in reading order and, separately, from top to bottom. */
function scriptOrder(title: Locator) {
  return title.locator('[lang]').evaluateAll((spellings) => ({
    read: spellings.map((spelling) => spelling.getAttribute('lang')),
    seen: spellings
      .map((spelling) => ({
        lang: spelling.getAttribute('lang'),
        top: spelling.getBoundingClientRect().top,
      }))
      .sort((a, b) => a.top - b.top)
      .map(({ lang }) => lang),
  }))
}

const IAST_FIRST = { read: ['sa-Latn', 'sa-Deva'], seen: ['sa-Latn', 'sa-Deva'] }
const DEVANAGARI_FIRST = { read: ['sa-Deva', 'sa-Latn'], seen: ['sa-Deva', 'sa-Latn'] }

/** Where each spelling's box starts down the screen, by script. */
function spellingTops(title: Locator) {
  return title
    .locator('[lang]')
    .evaluateAll((spellings) =>
      Object.fromEntries(
        spellings.map((spelling) => [
          spelling.getAttribute('lang') ?? '',
          spelling.getBoundingClientRect().top,
        ]),
      ),
    )
}

test.beforeEach(async ({ page }) => {
  await recordPageTurns(page)
  await recordScriptedAnimations(page)
  await gotoReady(page, '/concepts/vikshepa')
})

test('the "Devanagari first" switch puts the Devanagari at the head of the heading, and back', async ({
  page,
}) => {
  const toggle = scriptSwitch(page)
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  expect(await scriptOrder(heading(page))).toEqual(IAST_FIRST)

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => scriptOrder(heading(page))).toEqual(DEVANAGARI_FIRST)
  await expect(toggle).toBeFocused()

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await expect.poll(() => scriptOrder(heading(page))).toEqual(IAST_FIRST)
  await expect(toggle).toBeFocused()
})

for (const key of ['Space', 'Enter']) {
  test(`pressing ${key} on the switch swaps the scripts, and focus stays on the switch`, async ({
    page,
  }) => {
    const toggle = scriptSwitch(page)
    await toggle.focus()
    await page.keyboard.press(key)
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => scriptOrder(heading(page))).toEqual(DEVANAGARI_FIRST)
    await expect(toggle).toBeFocused()

    await page.keyboard.press(key)
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(() => scriptOrder(heading(page))).toEqual(IAST_FIRST)
    await expect(toggle).toBeFocused()
  })
}

test('either way round, the heading keeps both spellings, each with its language tag, and passes axe', async ({
  page,
}) => {
  const title = heading(page)
  for (const pressed of ['false', 'true']) {
    await expect(scriptSwitch(page)).toHaveAttribute('aria-pressed', pressed)
    await expect(title.locator('[lang="sa-Latn"]')).toHaveText('Vikṣepa')
    await expect(title.locator('[lang="sa-Deva"]')).toHaveText('विक्षेप')
    await expect(title).toContainText('Vikṣepa')
    await expectNoAxeViolations(page)
    await scriptSwitch(page).click()
  }
})

test('the two spellings trade places through a view transition', async ({ page }) => {
  const title = heading(page)
  const before = await spellingTops(title)
  await scriptSwitch(page).click()
  await expect.poll(() => scriptOrder(title)).toEqual(DEVANAGARI_FIRST)
  const after = await spellingTops(title)

  const swaps = await inPageTransitions(page)
  expect(swaps).toHaveLength(1)
  const flights = swaps[0]?.flights ?? []
  expect(flights, 'only the two spellings fly').toHaveLength(2)
  for (const script of ['sa-Latn', 'sa-Deva']) {
    const [from = NaN, to = NaN] = [before[script], after[script]]
    const flight = flights.find(({ y: [start] }) => Math.abs(start - from) < 2)
    const [start = NaN, midway = NaN, end = NaN] = flight?.y ?? []
    expect(Math.abs(start - from), `${script} sets off from where it was`).toBeLessThan(2)
    expect(Math.abs(end - to), `${script} lands where it now is`).toBeLessThan(2)
    expect((midway - start) * (end - midway), `${script} flies between them`).toBeGreaterThan(0)
  }
})

test("the switch's knob springs across: it glides, runs past where it stops, and settles back", async ({
  page,
}) => {
  const toggle = scriptSwitch(page)
  const across = await knobPath(toggle, () => toggle.click())
  const [start = NaN] = across
  const end = across.at(-1) ?? NaN
  expect(end - start, 'it ends on the far side').toBeGreaterThan(8)
  expect(across.length, 'a glide passes through many places').toBeGreaterThan(4)
  expect(Math.max(...across), 'it runs past where it stops').toBeGreaterThan(end + 0.5)

  const back = await knobPath(toggle, () => toggle.press('Space'))
  expect(back.at(-1)).toBeCloseTo(start, 0)
  expect(Math.min(...back), 'it runs past where it stops').toBeLessThan(start - 0.5)
})

test('the switch is a target as tall as the site’s others, 48 px', async ({ page }) => {
  const box = await scriptSwitch(page).boundingBox()
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(48)
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(48)
})

test('pressing the switch again and again, quickly, leaves the heading in step with it', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const toggle = scriptSwitch(page)
  for (let press = 0; press < 5; press++) await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => scriptOrder(heading(page))).toEqual(DEVANAGARI_FIRST)
  for (let press = 0; press < 3; press++) await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await expect.poll(() => scriptOrder(heading(page))).toEqual(IAST_FIRST)
  expect(errors).toEqual([])
})
