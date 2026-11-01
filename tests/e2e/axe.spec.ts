import { expectNoAxeViolations } from './axe'
import { expect, test } from './fixtures'

// The helper itself, on pages made here, checked once, at 1440 px.
test.skip(({ viewport }) => viewport?.width !== 1440, 'checked once, at 1440 px')

const html = (body: string) =>
  `<!doctype html><html lang="en"><head><title>Axe</title></head><body>${body}</body></html>`

test('passes a page whose headings step down one level at a time', async ({ page }) => {
  await page.setContent(html('<main><h1>Title</h1><h2>Part</h2><p>Text.</p></main>'))
  await expectNoAxeViolations(page)
})

test('fails a page that skips from h1 to h3', async ({ page }) => {
  await page.setContent(html('<main><h1>Title</h1><h3>Part</h3><p>Text.</p></main>'))
  await expect(expectNoAxeViolations(page)).rejects.toThrow(/heading-order/)
})

test('fails a page with two unnamed main landmarks', async ({ page }) => {
  await page.setContent(
    html('<main><h1>Title</h1><p>Text.</p></main><div role="main"><p>More.</p></div>'),
  )
  await expect(expectNoAxeViolations(page)).rejects.toThrow(/landmark-/)
})
