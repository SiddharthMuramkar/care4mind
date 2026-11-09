import sharp from 'sharp'

import { expect, test } from './fixtures'
import { ROUTES } from './routes'

// A link shared on WhatsApp, LinkedIn or X shows the page's title, summary and card.

/** One page of each kind: the last the registry lists. */
const ONE_OF_EACH = [...new Map(ROUTES.map((route) => [route.kind, route])).values()]

/** A PNG's width and height, from its IHDR chunk. */
function pngSize(bytes: Buffer): { width: number; height: number } {
  expect(bytes.subarray(1, 4).toString('latin1'), 'a PNG signature').toBe('PNG')
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

/** Paper, as a share card is printed on it (`--color-surface`). */
const PAPER = [234, 219, 182] as const

/** How far a pixel's colour must be from paper, summed across its channels, to count as ink. */
const INK_DISTANCE = 60

/** Where the picture stands: the right-hand third, inside the card's padding and level with the title. */
const PICTURE = { left: 800, top: 187, width: 320, height: 320 }

/** The empty strip between the text and the picture, from just below the rule to the card's foot. */
const GUTTER = { left: 744, top: 135, width: 56, height: 495 }

type Region = typeof PICTURE

/** The share of pixels in a region of a card that are not paper. */
async function inkShare(png: Buffer, region: Region): Promise<number> {
  const { data, info } = await sharp(png)
    .extract(region)
    .raw()
    .toBuffer({ resolveWithObject: true })
  let ink = 0
  for (let at = 0; at < data.length; at += info.channels) {
    const distance = PAPER.reduce(
      (sum, value, channel) => sum + Math.abs((data[at + channel] ?? 0) - value),
      0,
    )
    if (distance > INK_DISTANCE) ink += 1
  }
  return ink / (region.width * region.height)
}

for (const route of ONE_OF_EACH) {
  test(`${route.path} (${route.kind}) has a share card`, async ({ page, request }) => {
    await page.goto(route.path)
    const meta = (key: string) =>
      page.locator(`meta[property="${key}"], meta[name="${key}"]`).first()

    await expect(meta('og:title')).toHaveAttribute('content', /\S/)
    await expect(meta('og:description')).toHaveAttribute('content', /\S/)
    await expect(meta('twitter:card')).toHaveAttribute('content', 'summary_large_image')
    const image = await meta('og:image').getAttribute('content')
    expect(image, 'og:image').toMatch(/opengraph-image/)
    await expect(meta('twitter:image')).toHaveAttribute('content', image ?? '')

    // The tag names the production host; the card itself is fetched from the server under test.
    const { pathname, search } = new URL(image ?? '')
    const response = await request.get(pathname + search)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/png')
    const png = await response.body()
    expect(pngSize(png)).toEqual({ width: 1200, height: 630 })
    expect(await inkShare(png, PICTURE), 'a picture in the right-hand third').toBeGreaterThan(0.1)
    expect(await inkShare(png, GUTTER), 'clear paper between the text and the picture').toBe(0)
  })
}
