import { expect, test } from './fixtures'
import { ROUTES } from './routes'

// A link shared on WhatsApp, LinkedIn or X shows the page's title, summary and card.

/** One page of each kind: the first the registry lists. */
const ONE_OF_EACH = [...new Map(ROUTES.map((route) => [route.kind, route])).values()].reverse()

/** A PNG's width and height, from its IHDR chunk. */
function pngSize(bytes: Buffer): { width: number; height: number } {
  expect(bytes.subarray(1, 4).toString('latin1'), 'a PNG signature').toBe('PNG')
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

for (const route of ONE_OF_EACH) {
  test(`${route.path} (${route.kind}) has a share card`, async ({ page, request }) => {
    await page.goto(route.path)
    const meta = (key: string) =>
      page.locator(`meta[property="${key}"], meta[name="${key}"]`).first()

    await expect(meta('og:title')).toHaveAttribute('content', /\S/)
    await expect(meta('og:description')).toHaveAttribute('content', /\S/)
    await expect(meta('twitter:card')).toHaveAttribute('content', 'summary_large_image')
    await expect(meta('twitter:image')).toHaveAttribute('content', /opengraph-image/)
    const image = await meta('og:image').getAttribute('content')
    expect(image, 'og:image').toMatch(/opengraph-image/)

    // The tag names the production host; the card itself is fetched from the server under test.
    const { pathname, search } = new URL(image ?? '')
    const response = await request.get(pathname + search)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/png')
    expect(pngSize(await response.body())).toEqual({ width: 1200, height: 630 })
  })
}
