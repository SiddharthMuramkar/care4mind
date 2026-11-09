import type { Page } from '@playwright/test'

import { expect, gotoReady, test } from './fixtures'

/** The homepage's hero Plate: the one picture allowed a `sizes` attribute. */
const HERO = '[data-hero-plate]'

/** The pictures the shared check looks at. */
const PICTURES = 'main img, footer img'

/** The pages the shared check visits. A page joins the list when it gets its first picture. */
const PAGES: { path: string; name: string }[] = [
  // Add a page in path order, not at the end.
]

/** Start adding up the page's layout shifts. Call it before opening the page. */
function watchLayoutShifts(page: Page) {
  return page.addInitScript(() => {
    const shifts: number[] = []
    Object.defineProperty(window, '__layoutShifts', { value: shifts })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        value: number
        hadRecentInput: boolean
      })[]) {
        if (!entry.hadRecentInput) shifts.push(entry.value)
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
}

/** Scroll to the foot of the page in steps, so that every lazy picture starts to load. */
async function scrollToFoot(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let top = 0; top <= height; top += 300) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), top)
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)))
  }
}

/** The pictures in `main` and the footer that have not finished loading, and those that failed. */
function pictureStates(page: Page) {
  return page.evaluate((pictures) => {
    const images = [...document.querySelectorAll<HTMLImageElement>(pictures)]
    return {
      loading: images.filter((image) => !image.complete).map((image) => image.src),
      broken: images
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.src),
    }
  }, PICTURES)
}

/** The pictures that set `sizes` without being the hero Plate, each of which would list every width. */
function picturesWithSizes(page: Page) {
  return page.evaluate(
    (hero) =>
      [
        ...document.querySelectorAll<HTMLImageElement>(
          `main img[sizes]:not(${hero}), footer img[sizes]:not(${hero})`,
        ),
      ].map((image) => image.src),
    HERO,
  )
}

/**
 * The pictures with no numeric width and height attributes, which hold no space until they load.
 * Summed layout shift cannot see these: a small one scores under the budget, and a lazy one below
 * the first screen scores nothing.
 */
function picturesWithoutSpace(page: Page) {
  return page.evaluate(
    (pictures) =>
      [...document.querySelectorAll<HTMLImageElement>(pictures)]
        .filter(
          (image) =>
            !(Number(image.getAttribute('width')) > 0 && Number(image.getAttribute('height')) > 0),
        )
        .map((image) => image.src),
    PICTURES,
  )
}

/** Fail a page with no picture, where the shared check would pass having looked at nothing. */
async function expectSomePicture(page: Page) {
  expect(await page.locator(PICTURES).count(), 'pictures on the page').toBeGreaterThan(0)
}

/** The check every page with pictures passes. Call `watchLayoutShifts` before opening the page. */
async function expectPicturesBehave(page: Page) {
  await scrollToFoot(page)
  await expect
    .poll(async () => (await pictureStates(page)).loading, {
      message: 'every picture finishes loading',
      timeout: 30_000,
    })
    .toEqual([])
  expect((await pictureStates(page)).broken, 'pictures that failed to load').toEqual([])
  expect(await picturesWithSizes(page), 'pictures that set sizes').toEqual([])
  expect(await picturesWithoutSpace(page), 'pictures with no reserved space').toEqual([])
  const shift = await page.evaluate(() =>
    (window as unknown as { __layoutShifts: number[] }).__layoutShifts.reduce((a, b) => a + b, 0),
  )
  expect(shift, 'layout shift').toBeLessThan(0.01)
}

for (const { path, name } of PAGES) {
  test(`on the ${name} at ${path}, every picture loads, keeps its width list short and shifts nothing`, async ({
    page,
  }) => {
    await watchLayoutShifts(page)
    const response = await gotoReady(page, path)
    expect(response?.status(), 'the page exists').toBe(200)
    await expectSomePicture(page)
    await expectPicturesBehave(page)
  })
}

// The check itself, on pages made here, so that a broken check cannot pass unnoticed.
test.describe('the shared check', { tag: '@one-width' }, () => {
  const PIXEL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

  /** Open a made-up page through the same path as a real one. */
  async function open(page: Page, body: string) {
    await page.route('**/made-for-the-check/', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: `<!doctype html><html lang="en" data-hydrated><head><title>Check</title></head><body>${body}</body></html>`,
      }),
    )
    await watchLayoutShifts(page)
    await gotoReady(page, '/made-for-the-check/')
  }

  test('passes a picture with no sizes, and the hero Plate with them', async ({ page }) => {
    await open(
      page,
      `<main><img src="${PIXEL}" width="1" height="1" alt=""><img src="${PIXEL}" width="1" height="1" sizes="360px" data-hero-plate alt=""></main>`,
    )
    await expectSomePicture(page)
    await expectPicturesBehave(page)
  })

  test('fails a page with no pictures', async ({ page }) => {
    await open(page, '<main><p>Only words here.</p></main>')
    await expect(expectSomePicture(page)).rejects.toThrow(/pictures on the page/)
  })

  test('fails a picture in main that sets sizes', async ({ page }) => {
    await open(page, `<main><img src="${PIXEL}" sizes="100vw" alt=""></main>`)
    await expect(expectPicturesBehave(page)).rejects.toThrow(/pictures that set sizes/)
  })

  test('fails a picture in the footer that sets sizes', async ({ page }) => {
    await open(page, `<footer><img src="${PIXEL}" sizes="100vw" alt=""></footer>`)
    await expect(expectPicturesBehave(page)).rejects.toThrow(/pictures that set sizes/)
  })

  test('fails a picture that does not load', async ({ page }) => {
    await open(page, '<main><img src="data:image/png;base64,bm90IGEgcGljdHVyZQ==" alt=""></main>')
    await expect(expectPicturesBehave(page)).rejects.toThrow(/pictures that failed to load/)
  })

  test('fails a picture with no width or height', async ({ page }) => {
    await open(page, `<main><img src="${PIXEL}" alt=""></main>`)
    await expect(expectPicturesBehave(page)).rejects.toThrow(/pictures with no reserved space/)
  })

  test('fails a lazy picture below the first screen with no width or height', async ({ page }) => {
    await open(
      page,
      `<main><div style="height: 3000px"></div><img loading="lazy" src="${PIXEL}" alt=""></main>`,
    )
    await expect(expectPicturesBehave(page)).rejects.toThrow(/pictures with no reserved space/)
  })

  test('fails a page that shifts', async ({ page }) => {
    await open(
      page,
      `<main><div id="push"></div><p>Words that the block above pushes down the page.</p></main>
      <script>requestAnimationFrame(() => requestAnimationFrame(() => { document.getElementById('push').style.height = '300px' }))</script>`,
    )
    await expect(expectPicturesBehave(page)).rejects.toThrow(/layout shift/)
  })
})

test.describe('the image optimiser', { tag: '@one-width' }, () => {
  const plateAt = (width: number) =>
    `/_next/image/?url=%2Fart%2Fplates%2Fjeweller.jpg&w=${width}&q=75`

  test('serves a Plate as AVIF at a configured width, cached for 31 days', async ({ request }) => {
    const response = await request.get(plateAt(320), {
      headers: { Accept: 'image/avif,image/webp,*/*' },
    })
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/avif')
    expect(response.headers()['cache-control']).toContain('max-age=2678400')
  })

  test('refuses a width the pictures do not use', async ({ request }) => {
    const response = await request.get(plateAt(96), {
      headers: { Accept: 'image/avif,image/webp,*/*' },
    })
    expect(response.status()).toBe(400)
  })
})
