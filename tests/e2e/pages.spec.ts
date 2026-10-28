import { expectNoAxeViolations } from './axe'
import { animationsStartedOn, isDrawing, recordAnimationStarts } from './drawings'
import { expect, gotoReady, test } from './fixtures'
import { MISSING, PAGES } from './routes'

const noSidewaysScroll = () =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth

for (const { path, name } of PAGES) {
  test.describe(name, () => {
    test('loads with one h1 and no sideways scroll', async ({ page }) => {
      const response = await gotoReady(page, path)
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
      expect(await page.evaluate(noSidewaysScroll)).toBeLessThanOrEqual(0)
    })

    test('passes axe at WCAG 2.2 AA', async ({ page }) => {
      await gotoReady(page, path)
      await expectNoAxeViolations(page)
    })

    test('tells search engines not to index it, twice', async ({ page }) => {
      const response = await gotoReady(page, path)
      expect(response?.headers()['x-robots-tag']).toContain('noindex')
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    })

    test('has a title and a description', async ({ page }) => {
      await gotoReady(page, path)
      await expect(page).toHaveTitle(/Care4Mind/)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)
    })
  })
}

test.describe('404 page', () => {
  test('returns 404, is not indexed, and passes axe', async ({ page }) => {
    const response = await gotoReady(page, MISSING)
    expect(response?.status()).toBe(404)
    expect(response?.headers()['x-robots-tag']).toContain('noindex')
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/isn’t in the book/)
    await expect(page.getByRole('link', { name: 'Go to the homepage' })).toBeVisible()
    expect(await page.evaluate(noSidewaysScroll)).toBeLessThanOrEqual(0)
    await expectNoAxeViolations(page)
  })

  test('draws a small kolam on load, once, which ends complete and is silent', async ({ page }) => {
    await recordAnimationStarts(page)
    await gotoReady(page, MISSING)
    const kolam = page.getByRole('main').locator('svg')
    await expect(kolam).toHaveAttribute('aria-hidden', 'true')
    const line = kolam.locator('path')
    await expect(line, 'one unbroken line').toHaveCount(1)
    await expect.poll(() => isDrawing(line)).toBe(false)
    await expect(line).toHaveCSS('stroke-dashoffset', '0px')
    expect(await animationsStartedOn(line)).toEqual([
      { byScroll: false, duration: expect.closeTo(1600, -3) },
    ])
    const box = await kolam.boundingBox()
    expect(box?.width, 'a small one').toBeLessThanOrEqual(200)
  })
})

test('the skip link is the first thing keyboard focus reaches, and it works', async ({ page }) => {
  await gotoReady(page, '/concepts/vikshepa')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeInViewport()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
})

test('keyboard focus is visible', async ({ page }) => {
  await gotoReady(page, '/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  const outline = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement
    const style = getComputedStyle(element)
    return { width: style.outlineWidth, style: style.outlineStyle }
  })
  expect(outline.style).not.toBe('none')
  expect(parseFloat(outline.width)).toBeGreaterThanOrEqual(2)
})

test('pages below the homepage show breadcrumbs (FR-01)', async ({ page }) => {
  for (const { path } of PAGES.filter((entry) => entry.path !== '/')) {
    await gotoReady(page, path)
    const trail = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(trail.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(trail.locator('[aria-current="page"]')).toHaveCount(1)
  }
})

test('every internal link leads to a page that exists (NFR-04)', async ({ page, request }) => {
  const seen = new Set<string>()
  for (const { path } of PAGES) {
    await gotoReady(page, path)
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))
    for (const href of hrefs) seen.add(href.split('#')[0] || '/')
  }
  expect(seen.size).toBeGreaterThan(2)
  for (const href of seen) {
    const response = await request.get(href)
    expect(response.status(), href).toBe(200)
  }
})
