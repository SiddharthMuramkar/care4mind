import { unfinishedDrawings, unfinishedRules } from './drawings'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { breathes, logoLotus } from './lotuses'
import { READING_PAGES, readingThread, readTo } from './reading'
import { at, ROUTES_IN_SCOPE } from './routes'

// Firefox, and WebKit in CI: every route renders without errors or sideways scroll, with the
// wordmark and its lotus, and shows the drawings and rules these browsers can't drive by scroll simply finished.
for (const route of ROUTES_IN_SCOPE) {
  test(`${route.path} renders, its drawings and rules finished`, async ({ page }) => {
    const where = at(page, route.path)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const response = await gotoReady(page, route.path)

    expect.soft(response?.status(), `${where}: status`).toBe(200)
    await expect.soft(page.locator('h1'), `${where}: a visible h1`).toBeVisible()
    expect.soft(await scrollsSideways(page), `${where}: no sideways scroll`).toEqual([])
    const logo = page.getByRole('banner').getByRole('link', { name: 'Care4Mind home', exact: true })
    await expect.soft(logo, `${where}: the wordmark`).toHaveText('Care4Mind')
    await expect
      .soft(
        logo.locator(':is(path, line, polyline, polygon, img, canvas):not(svg[data-lotus] *)'),
        `${where}: the lotus and a set wordmark`,
      )
      .toHaveCount(0)
    expect.soft(await breathes(logoLotus(page)), `${where}: the logo's lotus rests`).toBe(false)
    await expect
      .poll(() => unfinishedDrawings(page), { message: `${where}: unfinished drawings` })
      .toEqual([])
    await expect
      .poll(() => unfinishedRules(page), { message: `${where}: rules short of full width` })
      .toEqual([])
    expect(errors, `${where}: page errors`).toEqual([])
  })
}

for (const { path, name } of READING_PAGES) {
  test(`${name} has no reading thread where scroll timelines are missing`, async ({ page }) => {
    await page.goto(path)
    const scrollTimelines = await page.evaluate(() => CSS.supports('animation-timeline: scroll()'))
    test.skip(scrollTimelines, 'this browser fills the thread on a scroll timeline')
    await readTo(page, 0.5)
    expect(await readingThread(page)).toBeNull()
  })
}
