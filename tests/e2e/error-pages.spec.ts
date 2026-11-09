import { expectNoAxeViolations } from './axe'
import { gotoErrorPage } from './error-page'
import { expect, scrollsSideways, test } from './fixtures'

for (const { kind, name, action } of [
  { kind: 'segment', name: 'the error page', action: 'Try again' },
  { kind: 'global', name: 'the global error page', action: 'Reload the page' },
] as const) {
  test.describe(name, () => {
    test.beforeEach(async ({ page }) => {
      await gotoErrorPage(page, kind)
    })

    test('is signed with the decorative Emblem, loaded and in its box', async ({ page }) => {
      const emblem = page.getByRole('main').locator('img')
      await expect(emblem).toHaveCount(1)
      await expect(emblem).toBeVisible()
      await expect(emblem).toHaveAttribute('alt', '')
      await expect(emblem).toHaveAttribute('src', /emblem-mark/)
      expect(await emblem.getAttribute('sizes')).toBeNull()
      expect(await emblem.boundingBox()).toMatchObject({ width: 96, height: 96 })
      await expect
        .poll(() => emblem.evaluate((image: HTMLImageElement) => image.naturalWidth))
        .toBeGreaterThan(0)
    })

    test('stands above the rest of the page, which still offers a way on', async ({ page }) => {
      const emblem = await page.getByRole('main').locator('img').boundingBox()
      const kicker = await page.getByText('Error · Page not shown').boundingBox()
      expect((emblem?.y ?? 0) + 96).toBeLessThanOrEqual(kicker?.y ?? 0)
      await expect(page.getByRole('button', { name: action })).toBeVisible()
    })

    test('fits the screen and passes the accessibility scan', async ({ page }) => {
      expect(await scrollsSideways(page)).toEqual([])
      await expectNoAxeViolations(page, name)
    })
  })
}
