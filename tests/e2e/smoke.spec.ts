import { frameKolam, openingFolio, unfinishedDrawings } from './drawings'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { READING_PAGES, readingThread, readTo } from './reading'
import { at, ROUTES_IN_SCOPE } from './routes'
import { travel } from './scrolling'

// Firefox, and WebKit in CI: every route renders without errors or sideways scroll, with the
// kolam logo, and shows the drawings these browsers can't drive by scroll simply finished.
for (const route of ROUTES_IN_SCOPE) {
  test(`${route.path} renders, its drawings finished`, async ({ page }) => {
    const where = at(page, route.path)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const response = await gotoReady(page, route.path)

    expect.soft(response?.status(), `${where}: status`).toBe(200)
    await expect.soft(page.locator('h1'), `${where}: a visible h1`).toBeVisible()
    expect.soft(await scrollsSideways(page), `${where}: no sideways scroll`).toEqual([])
    const logo = page.getByRole('banner').getByRole('link', { name: 'Care4Mind home', exact: true })
    await expect.soft(logo.locator('svg'), `${where}: the kolam logo`).toBeVisible()
    await expect
      .poll(() => unfinishedDrawings(page), { message: `${where}: unfinished drawings` })
      .toEqual([])
    expect(errors, `${where}: page errors`).toEqual([])
  })
}

test('the opening kolam scrolls with the page where scroll timelines are missing', async ({
  page,
}) => {
  await page.goto('/')
  const scrollTimelines = await page.evaluate(() => CSS.supports('animation-timeline: scroll()'))
  test.skip(scrollTimelines, 'this browser drifts the kolam on a scroll timeline')
  const [kolam, folio] = await travel(page, 240, await frameKolam(page), openingFolio(page))
  expect(folio).toBe(240)
  expect(kolam).toBe(folio)
})

for (const { path, name } of READING_PAGES) {
  test(`${name} has no reading thread where scroll timelines are missing`, async ({ page }) => {
    await page.goto(path)
    const scrollTimelines = await page.evaluate(() => CSS.supports('animation-timeline: scroll()'))
    test.skip(scrollTimelines, 'this browser fills the thread on a scroll timeline')
    await readTo(page, 0.5)
    expect(await readingThread(page)).toBeNull()
  })
}
