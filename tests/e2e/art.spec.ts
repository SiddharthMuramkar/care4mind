import type { Page } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'

/** The homepage's hero Plate: the one picture allowed a `sizes` attribute. */
const HERO = '[data-hero-plate]'

/** The pictures the shared check looks at. */
const PICTURES = 'main img, footer img'

/** The pages the shared check visits. A page joins the list when it gets its first picture. */
const PAGES: { path: string; name: string }[] = [
  // Add a page in path order, not at the end.
  { path: '/', name: 'homepage' },
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

/**
 * The picture at the head of each section page, as the pictures spec's table names it. Three stand
 * as their Interim picture, the clasped book, until their own Sticker is made.
 */
const SECTION_STICKERS = [
  { path: '/concepts/', file: 'cosmos' },
  { path: '/concepts/map/', file: 'cosmos' },
  { path: '/texts/', file: 'book-ornate' },
  { path: '/questionnaires/', file: 'clipboard' },
  { path: '/library/', file: 'book-clasp' },
  { path: '/library/textbooks/', file: 'book-clasp' },
  { path: '/library/inspirational-books/', file: 'book-clasp' },
  { path: '/library/courses/', file: 'gear' },
  { path: '/library/methods/', file: 'mind-tools' },
  { path: '/library/references/', file: 'book-clasp' },
  { path: '/start/', file: 'cosmos' },
  { path: '/search/', file: 'mind-dome' },
] as const

/** A query with no results. */
const NOTHING_FOUND = '/search/?q=zzqxqzzqx'

/** The picture at the head of the page: the only one a section page's header holds. */
const headSticker = (page: Page) => page.getByRole('main').locator('header img')

test.describe('section pages', () => {
  // The shared check at each section page, with the web fonts held back. Their late swap rewraps
  // some headings by itself, a shift the Sticker has no part in, so without them only a picture
  // that holds no space can move the page.
  for (const { path } of SECTION_STICKERS) {
    test(`${path}: the Sticker loads, keeps its width list short and shifts nothing`, async ({
      page,
    }) => {
      await page.route('**/*.woff2', (route) => route.abort())
      await watchLayoutShifts(page)
      const response = await gotoReady(page, path)
      expect(response?.status(), 'the page exists').toBe(200)
      await expectSomePicture(page)
      await expectPicturesBehave(page)
    })
  }

  for (const { path, file } of SECTION_STICKERS) {
    test(
      `${path} shows the ${file} Sticker, decorative, above its heading`,
      { tag: '@one-width' },
      async ({ page }) => {
        await gotoReady(page, path)
        const sticker = headSticker(page)
        await expect(sticker).toHaveCount(1)
        await expect(sticker).toHaveAttribute('alt', '')
        expect(decodeURIComponent((await sticker.getAttribute('src')) ?? '')).toContain(
          `/art/stickers/${file}.png`,
        )
        const [picture, heading] = await Promise.all([
          sticker.boundingBox(),
          page.getByRole('heading', { level: 1 }).boundingBox(),
        ])
        expect(picture?.y ?? Infinity, 'the Sticker comes before the heading').toBeLessThan(
          heading?.y ?? 0,
        )
      },
    )
  }

  test('a Sticker keeps its size, lists two files and never takes a click', async ({ page }) => {
    await gotoReady(page, '/concepts/')
    const sticker = headSticker(page)
    await expect(sticker).toHaveAttribute('width', '112')
    await expect(sticker).toHaveAttribute('height', '112')
    await expect(sticker).not.toHaveAttribute('sizes')
    await expect(sticker).toHaveCSS('pointer-events', 'none')
    const files = ((await sticker.getAttribute('srcset')) ?? '').split(', ')
    expect(files).toHaveLength(2)
    expect(files[0]).toMatch(/&w=112&.* 1x$/)
    expect(files[1]).toMatch(/&w=224&.* 2x$/)
    await expect
      .poll(() => sticker.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0)
    const box = await sticker.boundingBox()
    const expected = (page.viewportSize()?.width ?? 0) < 640 ? 88 : 112
    expect(box?.width).toBe(expected)
    expect(box?.height).toBe(expected)
  })

  test('Search shows its Sticker only when nothing is listed', async ({ page }) => {
    await gotoReady(page, '/search/')
    await expect(headSticker(page)).toHaveCount(1)
    await gotoReady(page, NOTHING_FOUND)
    await expect(page.getByRole('heading', { name: /^No results for/ })).toBeVisible()
    await expect(headSticker(page)).toHaveCount(1)
    await gotoReady(page, '/search/?q=karma')
    await expect(page.getByRole('heading', { name: /results? for/ })).toBeVisible()
    await expect(headSticker(page)).toHaveCount(0)
  })

  test('Search with nothing found passes axe, its Sticker in place', async ({ page }) => {
    await gotoReady(page, NOTHING_FOUND)
    await expect(headSticker(page)).toHaveCount(1)
    await expectNoAxeViolations(page)
  })

  test('the proposals page has no Sticker', { tag: '@one-width' }, async ({ page }) => {
    await gotoReady(page, '/proposals/')
    await expect(headSticker(page)).toHaveCount(0)
  })

  const stickerFiles = [...new Set(SECTION_STICKERS.map(({ file }) => file))]
  for (const file of stickerFiles) {
    for (const format of ['avif', 'webp']) {
      test(
        `the ${file} Sticker weighs at most 20 KB at 2x as ${format}`,
        { tag: '@one-width' },
        async ({ request }) => {
          const response = await request.get(
            `/_next/image/?url=%2Fart%2Fstickers%2F${file}.png&w=224&q=75`,
            { headers: { Accept: `image/${format}` } },
          )
          expect(response.status()).toBe(200)
          expect(response.headers()['content-type']).toBe(`image/${format}`)
          expect((await response.body()).byteLength).toBeLessThanOrEqual(20_000)
        },
      )
    }
  }
})

/**
 * Each topic's card and its picture, as the pictures spec's table names it. Three stand as their
 * Interim picture until their own Sticker is made.
 */
const TOPIC_STICKERS = [
  { slug: 'self', file: 'cosmos' },
  { slug: 'mind', file: 'mind-swirl' },
  { slug: 'practice', file: 'meditation' },
  { slug: 'values', file: 'book-ornate' },
  { slug: 'temperament', file: 'gear' },
] as const

/** The pages that show the topic cards. */
const TOPIC_CARD_PAGES = ['/', '/concepts/'] as const

const topicCard = (page: Page, slug: string) => page.locator(`article[data-topic="${slug}"]`)
/** A direct child of the card's `article`: the only place the lift reaches. */
const cardSticker = (page: Page, slug: string) => topicCard(page, slug).locator(':scope > img')
const cardLink = (page: Page, slug: string) => topicCard(page, slug).getByRole('link')

test.describe('topic cards', () => {
  for (const path of TOPIC_CARD_PAGES) {
    test(
      `${path}: each card shows its own Sticker, decorative, at 64 px, none repeated`,
      { tag: '@one-width' },
      async ({ page }) => {
        await gotoReady(page, path)
        await expect(page.locator('article[data-topic]')).toHaveCount(TOPIC_STICKERS.length)
        const shown: string[] = []
        for (const { slug, file } of TOPIC_STICKERS) {
          const sticker = cardSticker(page, slug)
          await expect(sticker).toHaveCount(1)
          await expect(sticker).toHaveAttribute('alt', '')
          await expect(sticker).toHaveAttribute('width', '64')
          await expect(sticker).toHaveAttribute('height', '64')
          const src = decodeURIComponent((await sticker.getAttribute('src')) ?? '')
          expect(src).toContain(`/art/stickers/${file}.png`)
          shown.push(src)
        }
        expect(new Set(shown).size, 'no Sticker repeats in the row').toBe(TOPIC_STICKERS.length)
      },
    )

    test(`${path}: the picture has its own row above the title, the numeral to its right`, async ({
      page,
    }) => {
      await gotoReady(page, path)
      for (const { slug } of TOPIC_STICKERS) {
        const card = topicCard(page, slug)
        const [picture, numeral, title] = await Promise.all([
          cardSticker(page, slug).boundingBox(),
          card.locator(':scope > span[aria-hidden]').boundingBox(),
          card.getByRole('heading').boundingBox(),
        ])
        if (!picture || !numeral || !title) throw new Error(`The ${slug} card is laid out.`)
        expect(picture.y + picture.height, `${slug}: above the title`).toBeLessThanOrEqual(title.y)
        expect(numeral.x, `${slug}: the numeral beside it`).toBeGreaterThanOrEqual(
          picture.x + picture.width,
        )
        expect(
          numeral.y + numeral.height,
          `${slug}: the numeral above the title`,
        ).toBeLessThanOrEqual(title.y)
      }
    })

    test(`${path}: the picture and the lines keep an even rhythm, with or without a term`, async ({
      page,
    }) => {
      await gotoReady(page, path)
      const textGap = (page.viewportSize()?.width ?? 0) < 640 ? 4 : 8
      for (const { slug } of TOPIC_STICKERS) {
        const card = topicCard(page, slug)
        // The count is the last line, and a term, on the cards that have one, the line above it.
        const lines = card.locator(':scope > p')
        const above = (await lines.count()) > 1 ? lines.first() : card.getByRole('heading')
        const [picture, title, line, count] = await Promise.all([
          cardSticker(page, slug).boundingBox(),
          card.getByRole('heading').boundingBox(),
          above.boundingBox(),
          lines.last().boundingBox(),
        ])
        if (!picture || !title || !line || !count) throw new Error(`The ${slug} card is laid out.`)
        expect(title.y - (picture.y + picture.height), `${slug}: picture to title`).toBeCloseTo(
          8,
          0,
        )
        expect(count.y - (line.y + line.height), `${slug}: above the count`).toBeCloseTo(textGap, 0)
      }
    })

    test(`${path}: a lifted card leaves the page with no sideways scroll`, async ({ page }) => {
      await gotoReady(page, path)
      await cardLink(page, 'self').hover()
      await expect(topicCard(page, 'self')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -3)')
      expect(await scrollsSideways(page)).toEqual([])
    })
  }

  test('a pointer at a card’s bottom edge keeps it lifted, and past the edge it finds no link', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/')
    const card = topicCard(page, 'self')
    await card.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
    const box = await card.boundingBox()
    if (!box) throw new Error('The self card is laid out.')
    const x = box.x + box.width / 2
    const bottom = box.y + box.height

    const hitBelow = await page.evaluate(
      (point) => !!document.elementFromPoint(point.x, point.y)?.closest('article[data-topic]'),
      { x, y: bottom + 2 },
    )
    expect(hitBelow, 'the link stops at the card').toBe(false)

    await page.mouse.move(x, bottom - 1.5)
    await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -3)')
    // The same point again, now that the card is up: the browser tests what is under the pointer.
    await page.mouse.move(x, bottom - 1.5)
    expect(await card.evaluate((el) => el.matches(':hover')), 'the card keeps the pointer').toBe(
      true,
    )
    await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -3)')
  })

  test(
    'hovering a card lifts its Sticker alone, and the page-head Sticker stays still',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/concepts/')
      await cardLink(page, 'self').hover()
      await expect(cardSticker(page, 'self')).not.toHaveCSS('transform', 'none')
      await expect(cardSticker(page, 'mind')).toHaveCSS('transform', 'none')
      await expect(headSticker(page)).toHaveCSS('transform', 'none')
    },
  )

  test(
    'focusing a card lifts its Sticker alone, and the page-head Sticker stays still',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/concepts/')
      await cardLink(page, 'mind').focus()
      await expect(cardSticker(page, 'mind')).not.toHaveCSS('transform', 'none')
      await expect(cardSticker(page, 'self')).toHaveCSS('transform', 'none')
      await expect(headSticker(page)).toHaveCSS('transform', 'none')
    },
  )

  test('pressing a card presses its Sticker', { tag: '@one-width' }, async ({ page }) => {
    await gotoReady(page, '/concepts/')
    await cardLink(page, 'self').hover()
    await page.mouse.down()
    await expect(cardSticker(page, 'self')).toHaveCSS('transform', 'matrix(0.97, 0, 0, 0.97, 0, 0)')
    await page.mouse.up()
  })

  test(
    'under reduced motion a hovered card’s Sticker has no transform',
    { tag: '@one-width' },
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoReady(page, '/concepts/')
      await cardLink(page, 'self').hover()
      expect(
        await topicCard(page, 'self').evaluate((card) => card.matches(':hover')),
        'the card is hovered',
      ).toBe(true)
      await expect(cardSticker(page, 'self')).toHaveCSS('transform', 'none')
    },
  )

  test(
    'a click on the picture follows the card’s link',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/concepts/')
      await expect(cardSticker(page, 'self')).toHaveCSS('pointer-events', 'none')
      const href = await cardLink(page, 'self').getAttribute('href')
      if (!href) throw new Error('The self card has a link.')
      // Forced, because the picture itself refuses the pointer: the click lands on whatever is under it.
      await cardSticker(page, 'self').click({ force: true })
      await expect(page).toHaveURL(new RegExp(`${href}$`))
    },
  )

  test(
    'tabbing goes from link to link, never to a picture',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/concepts/')
      await cardLink(page, 'self').focus()
      for (const { slug } of TOPIC_STICKERS.slice(1)) {
        await page.keyboard.press('Tab')
        await expect(cardLink(page, slug)).toBeFocused()
      }
    },
  )

  test(
    'a card has no paper edging and names its topic once',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/concepts/')
      for (const { slug } of TOPIC_STICKERS) {
        await expect(topicCard(page, slug)).not.toHaveAttribute('data-paper')
        await expect(topicCard(page, slug).locator('[data-topic]')).toHaveCount(0)
      }
    },
  )

  test('no A to Z entry has a picture', { tag: '@one-width' }, async ({ page }) => {
    await gotoReady(page, '/concepts/')
    const index = page.getByRole('region', { name: 'From A to Z' })
    await expect(index.getByRole('listitem').first()).toBeVisible()
    await expect(index.locator('img')).toHaveCount(0)
  })
})

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
