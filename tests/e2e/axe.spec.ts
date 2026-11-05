import { expectNoAxeViolations } from './axe'
import { expect, test } from './fixtures'

// The helper itself, on pages made here, checked once, at 1440 px (@from-1440).

const html = (body: string) =>
  `<!doctype html><html lang="en"><head><title>Axe</title></head><body>${body}</body></html>`

test(
  'passes a page whose headings step down one level at a time',
  { tag: '@from-1440' },
  async ({ page }) => {
    await page.setContent(html('<main><h1>Title</h1><h2>Part</h2><p>Text.</p></main>'))
    await expectNoAxeViolations(page)
  },
)

test('fails a page that skips from h1 to h3', { tag: '@from-1440' }, async ({ page }) => {
  await page.setContent(html('<main><h1>Title</h1><h3>Part</h3><p>Text.</p></main>'))
  await expect(expectNoAxeViolations(page)).rejects.toThrow(/heading-order/)
})

test(
  'fails a page whose text contrast axe cannot settle for an unreviewed reason',
  { tag: '@from-1440' },
  async ({ page }) => {
    await page.setContent(
      html(
        "<main><h1>Title</h1><p style=\"background-image: url(&quot;data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><rect width='4' height='4' fill='%23777'/></svg>&quot;); color: #888\">Text over an image.</p></main>",
      ),
    )
    await expect(expectNoAxeViolations(page)).rejects.toThrow(/color-contrast/)
  },
)

test(
  'passes unsettled text whose colours are a reviewed pair at 4.5:1',
  { tag: '@from-1440' },
  async ({ page }) => {
    // A paper link at rest: axe leaves it unsettled (bgGradient) for the 0-wide underline gradient, and surface-link on surface is a reviewed pair.
    await page.setContent(
      html(
        '<main style="background: #eadbb6"><h1>Title</h1><p><a href="#" style="color: #9c2a1f; background: linear-gradient(#c8342a, #c8342a) 0 0 / 0 0.12em no-repeat">A link on paper</a></p></main>',
      ),
    )
    await expectNoAxeViolations(page)
  },
)

test(
  'fails one unsettled character whose colours are no reviewed pair',
  { tag: '@from-1440' },
  async ({ page }) => {
    await page.setContent(html('<main><h1>Title</h1><p style="color: #cccccc">H</p></main>'))
    await expect(expectNoAxeViolations(page)).rejects.toThrow(/color-contrast/)
  },
)

test(
  'fails unsettled text over a covering gradient whose colours are no reviewed pair',
  { tag: '@from-1440' },
  async ({ page }) => {
    await page.setContent(
      html(
        '<main><h1>Title</h1><p style="color: #bbbbbb; background: linear-gradient(#ffffff, #eeeeee)">Text over a gradient.</p></main>',
      ),
    )
    await expect(expectNoAxeViolations(page)).rejects.toThrow(/color-contrast/)
  },
)

test(
  'fails unsettled text under a full-covering scroll shadow below 4.5:1',
  { tag: '@from-1440' },
  async ({ page }) => {
    // surface-link on surface is a reviewed pair at rest, but under the full scroll-shadow shade it falls to about 2.5:1; only an edge sliver of that shade may pass.
    await page.setContent(
      html(
        '<main style="background: #eadbb6"><h1>Title</h1><p style="color: #9c2a1f; background: linear-gradient(rgba(11, 13, 31, 0.35), rgba(11, 13, 31, 0.35))">Shaded link text</p></main>',
      ),
    )
    await expect(expectNoAxeViolations(page)).rejects.toThrow(/color-contrast/)
  },
)

test('fails a page with two unnamed main landmarks', { tag: '@from-1440' }, async ({ page }) => {
  await page.setContent(
    html('<main><h1>Title</h1><p>Text.</p></main><div role="main"><p>More.</p></div>'),
  )
  await expect(expectNoAxeViolations(page)).rejects.toThrow(/landmark-/)
})
