import type { Locator, Page } from '@playwright/test'

import { heroPlates } from '@/art/assign'
import { ART } from '@/art/registry'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'

/** The homepage's hero Plate: the one picture allowed a `sizes` attribute. */
const HERO = '[data-hero-plate]'

/** The pictures the shared check looks at. */
const PICTURES = 'main img, footer img'

/** The pages the shared check visits. A page joins the list when `main` gets its first picture. */
const PAGES: { path: string; name: string }[] = [
  // Add a page in path order, not at the end.
  { path: '/', name: 'homepage' },
  { path: '/concepts/vikshepa/', name: 'Vikṣepa Concept page' },
  { path: '/topics/mind/', name: 'mind topic page' },
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

/**
 * Fail a page with no picture of its own, where the shared check would pass having looked at
 * nothing. The footer does not count: its Emblem is on every page.
 */
async function expectSomePicture(page: Page) {
  expect(await page.locator('main img').count(), 'pictures on the page').toBeGreaterThan(0)
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
    // Late web fonts move the text as they arrive, so without them the sum measures only pictures.
    await page.route(/\.woff2?($|\?)/, (route) => route.abort())
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
  }

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

/**
 * The picture at the head of a Concept page until the Concept has its own Plate: its topic's
 * Sticker, or the Interim picture of a topic whose Sticker is not made yet.
 */
const CONCEPT_HEADS = [
  { path: '/concepts/vikshepa/', file: 'mind-swirl' },
  { path: '/concepts/atman/', file: 'cosmos' },
  { path: '/concepts/ahimsa/', file: 'book-ornate' },
  { path: '/concepts/triguna/', file: 'gear' },
] as const

test.describe('Concept pages', () => {
  for (const { path, file } of CONCEPT_HEADS) {
    test(
      `${path} shows the ${file} picture, decorative, centred above its title`,
      { tag: '@one-width' },
      async ({ page }) => {
        await gotoReady(page, path)
        const picture = headSticker(page)
        await expect(picture).toHaveCount(1)
        await expect(picture).toHaveAttribute('alt', '')
        expect(decodeURIComponent((await picture.getAttribute('src')) ?? '')).toContain(
          `/art/stickers/${file}.png`,
        )
        const [box, heading] = await Promise.all([
          picture.boundingBox(),
          page.getByRole('heading', { level: 1 }).boundingBox(),
        ])
        if (!box || !heading) throw new Error('The title page has its parts.')
        expect(box.y + box.height).toBeLessThanOrEqual(heading.y)
        expect(Math.abs(box.x + box.width / 2 - (heading.x + heading.width / 2))).toBeLessThan(1.5)
      },
    )
  }

  test('the picture is 120 px, 88 on a phone, and lists two files', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const picture = headSticker(page)
    await expect(picture).toHaveAttribute('width', '120')
    await expect(picture).not.toHaveAttribute('sizes')
    const files = ((await picture.getAttribute('srcset')) ?? '').split(', ')
    expect(files).toHaveLength(2)
    expect(files[0]).toMatch(/&w=120&.* 1x$/)
    expect(files[1]).toMatch(/&w=240&.* 2x$/)
    await expect
      .poll(() => picture.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0)
    const box = await picture.boundingBox()
    const expected = (page.viewportSize()?.width ?? 0) < 640 ? 88 : 120
    expect(box?.width).toBe(expected)
    expect(box?.height).toBe(expected)
  })
})

/** The pages that list Concept cards. */
const CONCEPT_CARD_PAGES = ['/', '/start/', '/topics/mind/'] as const

test.describe('Concept cards', () => {
  for (const path of CONCEPT_CARD_PAGES) {
    test(`on ${path} none shows an Interim picture, and a bare card keeps no empty row`, async ({
      page,
    }) => {
      await gotoReady(page, path)
      // Only a Concept card or a Folio is paper; the Folio is the one with the page's heading.
      const cards = page.getByRole('main').locator('article[data-paper]:not(:has(h1))')
      expect(await cards.count(), 'Concept cards on the page').toBeGreaterThan(0)
      await expect(cards.locator('img[src*="stickers"]')).toHaveCount(0)
      for (const card of await cards.all()) {
        if ((await card.locator('img').count()) > 0) continue
        const [box, title] = await Promise.all([
          card.boundingBox(),
          card.getByRole('heading', { level: 3 }).boundingBox(),
        ])
        if (!box || !title) throw new Error('A card has its title.')
        // The smallest picture and its gap would push the title down by at least 72 px.
        expect(title.y - box.y, 'a bare card opens on its title').toBeLessThan(64)
      }
    })
  }
})

test.describe('the hero Plate', () => {
  const figure = (page: Page) => page.locator(`figure:has(${HERO})`)

  test('opens the homepage with the first Plate and says which of the seven it is', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    await expect(page.locator(HERO)).toHaveCount(1)
    await expect(page.locator(HERO)).toHaveAttribute('alt', /^A jeweller in a maroon turban/)
    await expect(figure(page).locator('figcaption')).toHaveText('The jeweller · 1 of 7')
  })

  /** The Medallion the hero Plate sits in, the Folio it stands on, and the heading beside it. */
  async function heroBoxes(page: Page) {
    const heading = page.getByRole('heading', { level: 1 })
    const [circle, folio, title, motto] = await Promise.all([
      page.locator(HERO).locator('xpath=..').boundingBox(),
      heading.locator('xpath=..').boundingBox(),
      heading.boundingBox(),
      heading.locator('xpath=preceding-sibling::p[1]').boundingBox(),
    ])
    if (!circle || !folio || !title || !motto) throw new Error('the hero has all four parts')
    return { circle, folio, title, motto }
  }

  test(
    'from 64rem stands at 360 px in its own column, left of the heading, on a 72rem Folio',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await gotoReady(page, '/')
      const { circle, folio, title } = await heroBoxes(page)
      expect(circle.width).toBe(360)
      expect(circle.height).toBe(360)
      expect(circle.x + circle.width).toBeLessThan(title.x)
      expect(folio.width).toBe(72 * 16)
    },
  )

  for (const width of [360, 768]) {
    test(
      `at ${width} px stands at 168 px above the motto`,
      { tag: '@self-width' },
      async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await gotoReady(page, '/')
        const { circle, motto } = await heroBoxes(page)
        expect(circle.width).toBe(168)
        expect(circle.y + circle.height).toBeLessThanOrEqual(motto.y)
        expect(Math.abs(circle.x + circle.width / 2 - width / 2)).toBeLessThan(1)
      },
    )
  }

  test('keeps the heading a direct child of the Folio', async ({ page }) => {
    await gotoReady(page, '/')
    await expect(page.locator('[data-paper] > h1')).toHaveCount(1)
  })

  const SIZES = '(min-width: 64rem) 360px, 168px'

  test('is the only picture preloaded, and the only one that sets sizes', async ({ page }) => {
    await gotoReady(page, '/')
    const preloads = page.locator('head link[rel="preload"][as="image"]')
    await expect(preloads).toHaveCount(1)
    await expect(preloads).toHaveAttribute('imagesizes', SIZES)
    await expect(preloads).toHaveAttribute('imagesrcset', /%2Fart%2Fplates%2Fjeweller\.jpg/)
    const withSizes = page.locator('img[sizes]')
    await expect(withSizes).toHaveCount(1)
    await expect(withSizes).toHaveAttribute('sizes', SIZES)
    await expect(withSizes).toHaveAttribute('data-hero-plate')
  })

  /** The empty row under the caption that the viewer's buttons will stand in. */
  const controlsRow = (page: Page) => figure(page).locator('> :last-child')

  test('keeps its button row at full height, with or without the script', async ({
    page,
    browser,
    viewport,
  }) => {
    await gotoReady(page, '/')
    const hydrated = await controlsRow(page).boundingBox()
    expect(hydrated?.height, 'tall enough for a 44 px button').toBeGreaterThanOrEqual(44)

    const context = await browser.newContext({ javaScriptEnabled: false, viewport })
    const bare = await context.newPage()
    await bare.goto('/')
    const firstPaint = await controlsRow(bare).boundingBox()
    await context.close()
    expect(firstPaint?.height).toBe(hydrated?.height)
  })

  test('passes axe', async ({ page }) => {
    await gotoReady(page, '/')
    await expectNoAxeViolations(page)
  })

  test(
    'keeps each of its seven Plates within 120 KB at 750 px',
    { tag: '@one-width' },
    async ({ request }) => {
      test.slow()
      for (const id of heroPlates) {
        const record = ART.find((picture) => picture.id === id)
        if (!record) throw new Error(`no record for ${id}`)
        const response = await request.get(
          `/_next/image/?url=${encodeURIComponent(record.src)}&w=750&q=75`,
          { headers: { Accept: 'image/avif' } },
        )
        expect(response.headers()['content-type'], id).toBe('image/avif')
        expect((await response.body()).length, id).toBeLessThanOrEqual(120 * 1024)
      }
    },
  )
})

/** A homepage section, found by its heading or label. */
const homeSection = (page: Page, name: string) => page.getByRole('region', { name, exact: true })

const MIND = 'What’s on your mind?'
const TOPICS = 'Explore by topic'
const FEATURED = 'Start with these'
const WHO = 'Who’s behind this'
const CLOSING = 'Closing'

test.describe('the homepage around its pictures', () => {
  test('a decorative 56 px Sticker stands beside What’s on your mind?', async ({ page }) => {
    await gotoReady(page, '/')
    const section = homeSection(page, MIND)
    const sticker = section.locator('img')
    await expect(sticker).toHaveCount(1)
    await expect(sticker).toHaveAttribute('alt', '')
    expect(decodeURIComponent((await sticker.getAttribute('src')) ?? '')).toContain(
      '/art/stickers/mind-dome.png',
    )
    const [box, heading] = await Promise.all([
      sticker.boundingBox(),
      section.getByRole('heading', { level: 2 }).boundingBox(),
    ])
    if (!box || !heading) throw new Error('The heading and its Sticker are laid out.')
    expect(box.width).toBe(56)
    expect(box.height).toBe(56)
    expect(box.x, 'after the heading').toBeGreaterThanOrEqual(heading.x + heading.width)
    expect(box.y + box.height / 2, 'level with the heading').toBeGreaterThan(heading.y)
    expect(box.y + box.height / 2).toBeLessThan(heading.y + heading.height)
  })

  for (const { width, beside } of [
    { width: 360, beside: false },
    { width: 768, beside: true },
    { width: 1440, beside: true },
  ]) {
    test(
      `at ${width} px the 120 px Emblem stands ${beside ? 'beside' : 'above'} Who’s behind this`,
      { tag: '@self-width' },
      async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await gotoReady(page, '/')
        const section = homeSection(page, WHO)
        const emblem = section.getByRole('img', { name: /^Care4Mind's emblem/ })
        await expect(emblem).toHaveCount(1)
        await emblem.scrollIntoViewIfNeeded()
        const [box, heading] = await Promise.all([
          emblem.boundingBox(),
          section.getByRole('heading', { level: 2 }).boundingBox(),
        ])
        if (!box || !heading) throw new Error('The heading and the Emblem are laid out.')
        expect(box.width).toBe(120)
        expect(box.height).toBe(120)
        if (beside) expect(box.x + box.width).toBeLessThan(heading.x)
        else expect(box.y + box.height).toBeLessThanOrEqual(heading.y)
      },
    )
  }

  test('the folk border runs the width of the closing section, above its line', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    const section = homeSection(page, CLOSING)
    const border = section.locator('svg')
    await expect(border).toHaveCount(1)
    await expect(border).toHaveAttribute('aria-hidden', 'true')
    const [box, line, inner] = await Promise.all([
      border.boundingBox(),
      section.locator('p').first().boundingBox(),
      section.evaluate((element) => {
        const { paddingLeft, paddingRight } = getComputedStyle(element)
        return element.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight)
      }),
    ])
    if (!box || !line) throw new Error('The border and the closing line are laid out.')
    expect(box.height).toBe(12)
    expect(Math.abs(box.width - inner)).toBeLessThan(1)
    expect(box.y + box.height).toBeLessThanOrEqual(line.y)
  })

  test('the sections widen to 72rem from 64rem', { tag: '@self-width' }, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await gotoReady(page, '/')
    for (const name of [MIND, TOPICS, FEATURED, WHO, CLOSING]) {
      const box = await homeSection(page, name).boundingBox()
      expect(box?.width, name).toBe(72 * 16)
    }
  })

  for (const width of [1024, 1440]) {
    test(
      `at ${width} px the five topic cards and three featured cards each fill one row`,
      { tag: '@self-width' },
      async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await gotoReady(page, '/')
        const tops = async (list: Locator) =>
          Promise.all((await list.all()).map(async (item) => (await item.boundingBox())?.y))

        const topicCards = homeSection(page, TOPICS).locator('article')
        await expect(topicCards).toHaveCount(5)
        expect(new Set(await tops(topicCards)).size, 'five topics, one row').toBe(1)

        const featured = homeSection(page, FEATURED).locator('article')
        await expect(featured).toHaveCount(3)
        expect(new Set(await tops(featured)).size, 'three cards, one row').toBe(1)
        const heights = await Promise.all(
          (await featured.all()).map(async (card) => (await card.boundingBox())?.height),
        )
        expect(new Set(heights).size, 'all one height').toBe(1)
        const links = homeSection(page, FEATURED).getByRole('link', { name: /^Read about/ })
        expect(new Set(await tops(links)).size, 'their links level').toBe(1)

        for (const cards of [topicCards, featured]) {
          const items = cards.locator('xpath=parent::li')
          for (const [i, card] of (await cards.all()).entries()) {
            const [box, column] = await Promise.all([
              card.boundingBox(),
              items.nth(i).boundingBox(),
            ])
            if (!box || !column) throw new Error('A card and its column are laid out.')
            expect(Math.abs(box.width - column.width), 'a card fills its column').toBeLessThan(1)
          }
          const titles = cards.getByRole('heading', { level: 3 })
          for (const title of await titles.all()) {
            expect(await brokenWords(title), 'no word in a title splits').toEqual([])
          }
        }
      },
    )
  }
})

/** The words of an element's text that run onto a second line. */
const brokenWords = (element: Locator) =>
  element.evaluate((node) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
    const broken: string[] = []
    while (walker.nextNode()) {
      const text = walker.currentNode as Text
      for (const { 0: word, index } of text.data.matchAll(/\S+/g)) {
        const range = document.createRange()
        range.setStart(text, index)
        range.setEnd(text, index + word.length)
        const lines = new Set([...range.getClientRects()].map(({ top }) => Math.round(top)))
        if (lines.size > 1) broken.push(word)
      }
    }
    return broken
  })

test.describe('the homepage’s picture weight', { tag: '@self-width' }, () => {
  // The chromium projects run at 1x, which would fetch the smaller file of each pair.
  test.use({ deviceScaleFactor: 2 })

  const KB = 1024

  test('the phone’s first screen stays within 120 KB of pictures', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await gotoReady(page, '/')
    const hero = page.locator(HERO)
    await expect
      .poll(() => hero.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0)
    const bytes = await page.evaluate(() => {
      const onScreen = [...document.querySelectorAll<HTMLImageElement>('main img')].filter(
        (image) => {
          const { top, bottom } = image.getBoundingClientRect()
          return top < window.innerHeight && bottom > 0
        },
      )
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return onScreen.reduce(
        (sum, image) =>
          sum + (entries.find(({ name }) => name === image.currentSrc)?.encodedBodySize ?? 0),
        0,
      )
    })
    expect(bytes, 'the hero Plate was measured').toBeGreaterThan(0)
    expect(bytes).toBeLessThanOrEqual(120 * KB)
  })

  test('the whole page stays within 350 KB of pictures', async ({ page }) => {
    test.slow()
    await page.setViewportSize({ width: 1440, height: 900 })
    await gotoReady(page, '/')
    for (const picture of await page.locator('main img').all()) {
      await picture.scrollIntoViewIfNeeded()
      await expect
        .poll(() => picture.evaluate((image: HTMLImageElement) => image.naturalWidth))
        .toBeGreaterThan(0)
    }
    const bytes = await page.evaluate(() =>
      (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
        .filter(({ name }) => name.includes('/_next/image'))
        .reduce((sum, { encodedBodySize }) => sum + encodedBodySize, 0),
    )
    expect(bytes, 'pictures were measured').toBeGreaterThan(0)
    expect(bytes).toBeLessThanOrEqual(350 * KB)
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

  test('fails a page whose only picture is in the footer', async ({ page }) => {
    await open(
      page,
      `<main><p>Only words here.</p></main><footer><img src="${PIXEL}" alt=""></footer>`,
    )
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
