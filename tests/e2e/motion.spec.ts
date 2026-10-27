import { expect, type Page, test } from '@playwright/test'

import { unfinishedDrawings } from './drawings'
import { PAGES } from './routes'

/** Animations still moving: anything running longer than the 1 ms the reduced-motion rule allows. */
async function movingAnimations(page: Page) {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => {
        if (animation.playState !== 'running') return false
        const duration = animation.effect?.getComputedTiming().duration
        return animation.timeline instanceof DocumentTimeline === false || Number(duration) > 1
      })
      .map((animation) => (animation as CSSAnimation).animationName ?? animation.id),
  )
}

// NFR-01: with "reduce motion" on, nothing moves on load, on scroll or on click.
for (const { path, name } of PAGES) {
  test(`${name} keeps still with reduced motion`, async ({ page }) => {
    await page.goto(path)
    expect(await movingAnimations(page)).toEqual([])

    await page.mouse.wheel(0, 4000)
    await page.waitForTimeout(100)
    expect(await movingAnimations(page)).toEqual([])

    // Disabled buttons (the Questionnaire's "Start") can't be clicked, so pick the first one that can.
    const button = page.locator('main button:enabled').first()
    if (await button.count()) {
      await button.scrollIntoViewIfNeeded()
      await button.click()
      await page.waitForTimeout(50)
      expect(await movingAnimations(page)).toEqual([])
    }
  })

  test(`${name} shows every drawing finished with reduced motion`, async ({ page }) => {
    await page.goto(path)
    expect(await unfinishedDrawings(page)).toEqual([])

    await page.mouse.wheel(0, 4000)
    await page.waitForTimeout(100)
    expect(await unfinishedDrawings(page)).toEqual([])
  })
}

// The reduce rule shortens any animation to 1 ms, so listen for animations starting at all.
test('pointing at or focusing the logo starts no drawing, with reduced motion', async ({
  page,
}) => {
  await page.goto('/')
  const logo = page.getByRole('banner').getByRole('link', { name: 'Care4Mind home', exact: true })
  await expect(logo.locator('svg path')).toHaveCount(1)
  const started = await page.evaluateHandle(() => {
    const names: string[] = []
    document.addEventListener('animationstart', (event) => names.push(event.animationName))
    return names
  })

  await logo.hover()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(logo).toBeFocused()
  await page.waitForTimeout(100)
  expect(await started.jsonValue()).toEqual([])
  expect(await movingAnimations(page)).toEqual([])
  expect(await unfinishedDrawings(page)).toEqual([])
})
