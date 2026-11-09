import type { Locator, Page } from '@playwright/test'

import { artFor, ownArt, type SectionKey } from '@/art'
import { heroPlates } from '@/art/assign'
import { originLine } from '@/art/origin'
import { ART } from '@/art/registry'
import type { ArtRecord } from '@/art/types'
import { concepts, questionnaires, works, type RouteEntry } from '@/content'

import { expectNoAxeViolations } from './axe'
import { gotoErrorPage } from './error-page'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { MISSING, ROUTES_IN_SCOPE } from './routes'

/** The homepage's hero Plate: the one picture allowed a `sizes` attribute. */
const HERO = '[data-hero-plate]'

/** The pictures the shared check looks at. */
const PICTURES = 'main img, footer img'

/** Every picture these tests' build shows: its draftArt flag is on, so drafts count too. */
const RECORDS: readonly ArtRecord[] = ART

/** The pages the shared check visits. A page joins the list when `main` gets its first picture. */
const PAGES: { path: string; name: string; status?: number }[] = [
  // Add a page in path order, not at the end.
  { path: '/', name: 'homepage' },
  { path: '/concepts/', name: 'Concepts page' },
  { path: '/concepts/map/', name: 'Concept map' },
  { path: '/concepts/vikshepa/', name: 'Vikṣepa Concept page' },
  { path: '/credits/', name: 'credits gallery' },
  { path: '/library/', name: 'Library' },
  { path: '/library/courses/', name: 'Courses page' },
  { path: '/library/inspirational-books/', name: 'Inspirational Books page' },
  { path: '/library/methods/', name: 'Methods page' },
  { path: '/library/references/', name: 'References page' },
  { path: '/library/textbooks/', name: 'Textbooks page' },
  { path: '/questionnaires/', name: 'Questionnaires page' },
  { path: '/questionnaires/karmayoga-scale/', name: 'KarmaYoga Scale page' },
  { path: '/search/', name: 'Search page' },
  { path: '/start/', name: 'Start page' },
  { path: '/texts/', name: 'Texts page' },
  { path: '/texts/yoga-sutra/', name: 'Traditional text page' },
  { path: '/topics/mind/', name: 'mind topic page' },
  { path: MISSING, name: '404 page', status: 404 },
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

for (const { path, name, status = 200 } of PAGES) {
  test(`on the ${name} at ${path}, every picture loads, keeps its width list short and shifts nothing`, async ({
    page,
  }) => {
    // Late web fonts move the text as they arrive, so without them the sum measures only pictures.
    await page.route(/\.woff2?($|\?)/, (route) => route.abort())
    await watchLayoutShifts(page)
    const response = await gotoReady(page, path)
    expect(response?.status(), 'the page answers as it should').toBe(status)
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
    const response = await gotoReady(page, '/proposals/')
    expect(response?.status(), 'the page exists').toBe(200)
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

/** The topics with a card. Which picture each shows is the registry's to say. */
const TOPIC_SLUGS = ['self', 'mind', 'practice', 'values', 'temperament'] as const

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
        await expect(page.locator('article[data-topic]')).toHaveCount(TOPIC_SLUGS.length)
        const shown: string[] = []
        for (const slug of TOPIC_SLUGS) {
          const sticker = cardSticker(page, slug)
          await expect(sticker).toHaveCount(1)
          await expect(sticker).toHaveAttribute('alt', '')
          await expect(sticker).toHaveAttribute('width', '64')
          await expect(sticker).toHaveAttribute('height', '64')
          const src = decodeURIComponent((await sticker.getAttribute('src')) ?? '')
          expect(src).toContain(artFor({ kind: 'topic-card', slug }).src)
          shown.push(src)
        }
        expect(new Set(shown).size, 'no Sticker repeats in the row').toBe(TOPIC_SLUGS.length)
      },
    )

    test(`${path}: the picture has its own row above the title, the numeral to its right`, async ({
      page,
    }) => {
      await gotoReady(page, path)
      for (const slug of TOPIC_SLUGS) {
        const card = topicCard(page, slug)
        const [picture, numeral, title] = await Promise.all([
          cardSticker(page, slug).boundingBox(),
          card.locator(':scope > span[aria-hidden]').boundingBox(),
          card.getByRole('heading').boundingBox(),
        ])
        if (!picture || !numeral || !title) throw new Error(`The ${slug} card is laid out.`)
        expect(picture.width, `${slug}: drawn at 64 px wide`).toBe(64)
        expect(picture.height, `${slug}: drawn at 64 px high`).toBe(64)
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
      for (const slug of TOPIC_SLUGS) {
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

  test(
    'a mouse press leaves no Sticker tilted once the pointer has gone',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/concepts/')
      await cardLink(page, 'self').hover()
      await page.mouse.down()
      await page.mouse.move(5, 5, { steps: 5 })
      await page.mouse.up()
      await expect(cardLink(page, 'self')).toBeFocused()
      await expect(cardSticker(page, 'self')).toHaveCSS('transform', 'none')
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
      for (const slug of TOPIC_SLUGS.slice(1)) {
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
      for (const slug of TOPIC_SLUGS) {
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
  { slug: 'vikshepa', file: 'mind-swirl' },
  { slug: 'atman', file: 'cosmos' },
  { slug: 'ahimsa', file: 'book-ornate' },
  { slug: 'triguna', file: 'gear' },
] as const

/** Vikṣepa's head is a Medallion once its Plate can show, and a bare Sticker until then. */
const VIKSHEPA_RINGED = ownArt({ kind: 'concept', slug: 'vikshepa' })?.family === 'plate'

test.describe('Concept pages', () => {
  for (const { slug, file } of CONCEPT_HEADS) {
    const path = `/concepts/${slug}/`
    test(`${path} shows its Plate or the ${file} picture, decorative, centred above its title`, async ({
      page,
    }) => {
      await gotoReady(page, path)
      const picture = headSticker(page)
      await expect(picture).toHaveCount(1)
      await expect(picture).toHaveAttribute('alt', '')
      expect(decodeURIComponent((await picture.getAttribute('src')) ?? '')).toContain(
        ownArt({ kind: 'concept', slug })?.src ?? `/art/stickers/${file}.png`,
      )
      const [box, heading] = await Promise.all([
        picture.boundingBox(),
        page.getByRole('heading', { level: 1 }).boundingBox(),
      ])
      if (!box || !heading) throw new Error('The title page has its parts.')
      expect(box.y + box.height).toBeLessThanOrEqual(heading.y)
      expect(Math.abs(box.x + box.width / 2 - (heading.x + heading.width / 2))).toBeLessThan(1.5)
    })
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
    const box = await (VIKSHEPA_RINGED ? ringOf(picture) : picture).boundingBox()
    const expected = (page.viewportSize()?.width ?? 0) < 640 ? 88 : 120
    expect(box?.width).toBe(expected)
    expect(box?.height).toBe(expected)
  })
})

const KARMAYOGA_SCALE = '/questionnaires/karmayoga-scale/'

test.describe('Questionnaire pages and cards', () => {
  test(
    'the KarmaYoga Scale page shows its own Plate, in its ring, centred above its title',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, KARMAYOGA_SCALE)
      const picture = headSticker(page)
      await expect(picture).toHaveCount(1)
      await expect(picture).toHaveAttribute('alt', '')
      expect(decodeURIComponent((await picture.getAttribute('src')) ?? '')).toContain(
        '/art/plates/karma-yoga.jpg',
      )
      // Two rings are drawn, one for each width: only the one this width shows is visible.
      await expect(
        page.getByRole('main').locator('header span:has(> img) > svg:visible'),
      ).toHaveCount(1)
      const [box, heading] = await Promise.all([
        picture.boundingBox(),
        page.getByRole('heading', { level: 1 }).boundingBox(),
      ])
      if (!box || !heading) throw new Error('The title page has its parts.')
      expect(box.y + box.height).toBeLessThanOrEqual(heading.y)
      expect(Math.abs(box.x + box.width / 2 - (heading.x + heading.width / 2))).toBeLessThan(1.5)
    },
  )

  test('the picture is 120 px, 88 on a phone, and lists two files', async ({ page }) => {
    await gotoReady(page, KARMAYOGA_SCALE)
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
    // The ring's band is 5% each side of the Medallion: the picture fills the 90% inside it.
    const wide = (page.viewportSize()?.width ?? 0) >= 640
    const box = await picture.locator('xpath=..').boundingBox()
    expect(box?.width).toBe(wide ? 120 : 88)
  })

  for (const format of ['avif', 'webp']) {
    test(
      `the KarmaYoga Scale Medallion weighs at most 25 KB at 2x as ${format}`,
      { tag: '@one-width' },
      async ({ request }) => {
        const response = await request.get(
          '/_next/image/?url=%2Fart%2Fplates%2Fkarma-yoga.jpg&w=240&q=75',
          { headers: { Accept: `image/${format}` } },
        )
        expect(response.status()).toBe(200)
        expect(response.headers()['content-type']).toBe(`image/${format}`)
        expect((await response.body()).byteLength).toBeLessThanOrEqual(25_000)
      },
    )
  }

  // Only a Questionnaire card or a Folio is paper; the Folio is the one with the page's heading.
  const cardsOn = (page: Page) =>
    page.getByRole('main').locator('article[data-paper]:not(:has(h1))')

  test('the KarmaYoga Scale card shows its Medallion in a row above the title, the status to its right', async ({
    page,
  }) => {
    await gotoReady(page, '/questionnaires/')
    const card = cardsOn(page).filter({ hasText: 'KarmaYoga Scale' })
    const picture = card.locator('img')
    await expect(picture).toHaveCount(1)
    await expect(picture).toHaveAttribute('alt', '')
    await expect(picture).toHaveAttribute('width', '64')
    expect(decodeURIComponent((await picture.getAttribute('src')) ?? '')).toContain(
      'karma-yoga.jpg',
    )
    const medallion = picture.locator('xpath=..')
    const [box, title, badge] = await Promise.all([
      medallion.boundingBox(),
      card.getByRole('heading', { level: 3 }).boundingBox(),
      card.getByText('Preview', { exact: true }).boundingBox(),
    ])
    if (!box || !title || !badge) throw new Error('The card has its parts.')
    expect(box.width).toBe(64)
    expect(box.y + box.height, 'the picture stands above the title').toBeLessThanOrEqual(title.y)
    expect(badge.x, 'the status stands to the picture’s right').toBeGreaterThanOrEqual(
      box.x + box.width,
    )
    expect(
      Math.abs(badge.y + badge.height / 2 - (box.y + box.height / 2)),
      'the status is centred on the picture',
    ).toBeLessThan(2)
  })

  test('the card’s picture takes no click and no focus', async ({ page }) => {
    await gotoReady(page, '/questionnaires/')
    const picture = cardsOn(page).filter({ hasText: 'KarmaYoga Scale' }).locator('img')
    await expect(picture).toHaveCSS('pointer-events', 'none')
    await expect(picture.locator('xpath=ancestor::a')).toHaveCount(0)
    await expect(picture).not.toHaveAttribute('tabindex')
  })

  test('no Questionnaire card shows an Interim picture', async ({ page }) => {
    await gotoReady(page, '/questionnaires/')
    const cards = cardsOn(page)
    expect(await cards.count(), 'Questionnaire cards on the page').toBeGreaterThan(0)
    await expect(cards.locator('img[src*="stickers"]')).toHaveCount(0)
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
        const [box, title] = await Promise.all([
          card.boundingBox(),
          card.getByRole('heading', { level: 3 }).boundingBox(),
        ])
        if (!box || !title) throw new Error('A card has its title.')
        const picture = card.locator('img')
        if ((await picture.count()) === 0) {
          // The smallest picture and its gap would push the title down by at least 72 px.
          expect(title.y - box.y, 'a bare card opens on its title').toBeLessThan(64)
          continue
        }
        await expect(picture).toHaveAttribute('width', path === '/' ? '72' : '64')
        const medallion = await ringOf(picture).boundingBox()
        if (!medallion) throw new Error('The picture is laid out.')
        expect(
          medallion.y + medallion.height,
          'the picture stands above the title',
        ).toBeLessThanOrEqual(title.y)
        const devanagari = card.locator('p[lang="sa-Deva"]')
        if ((await devanagari.count()) === 0) continue
        const written = await devanagari.boundingBox()
        if (!written) throw new Error('The Devanagari is laid out.')
        expect(written.x, 'the Devanagari stands to the picture’s right').toBeGreaterThanOrEqual(
          medallion.x + medallion.width,
        )
      }
    })
  }

  test.describe('side by side', () => {
    const LIST = '#featured ul'

    /** Marks the first `count` cards as having a Plate and the rest as bare. */
    const markPlates = (page: Page, count: number) =>
      page.locator(`${LIST} > li > article`).evaluateAll((all, count) => {
        all.forEach((card, index) => card.toggleAttribute('data-plate', index < count))
      }, count)

    test(
      'a card with a Plate takes its own row while a neighbour is bare',
      { tag: '@from-1440' },
      async ({ page }) => {
        await gotoReady(page, '/')
        const items = page.locator(`${LIST} > li`)
        await markPlates(page, 1)
        const [first, second, whole] = await Promise.all([
          items.nth(0).boundingBox(),
          items.nth(1).boundingBox(),
          page.locator(LIST).boundingBox(),
        ])
        if (!first || !second || !whole) throw new Error('The list has its cards.')
        expect(Math.abs(first.width - whole.width)).toBeLessThan(1)
        expect(second.y).toBeGreaterThanOrEqual(first.y + first.height)
      },
    )

    test(
      'cards stay side by side once all have a Plate',
      { tag: '@from-1440' },
      async ({ page }) => {
        await gotoReady(page, '/')
        const items = page.locator(`${LIST} > li`)
        await markPlates(page, await items.count())
        const [first, second] = await Promise.all([
          items.nth(0).boundingBox(),
          items.nth(1).boundingBox(),
        ])
        if (!first || !second) throw new Error('The list has its cards.')
        expect(second.x).toBeGreaterThan(first.x)
        expect(second.y).toBe(first.y)
      },
    )
  })
})

const WORKS = await works.list()

test.describe('Traditional text pages', () => {
  for (const { slug, href } of WORKS) {
    test(
      `${href} shows its Pothi or Interim picture, decorative, at 120 px`,
      { tag: '@one-width' },
      async ({ page }) => {
        await gotoReady(page, href)
        const expected = artFor({ kind: 'work', slug })
        const picture = headSticker(page)
        await expect(picture).toHaveCount(1)
        await expect(picture).toHaveAttribute('alt', '')
        await expect(picture).toHaveAttribute('width', '120')
        await expect(picture).toHaveAttribute(
          'height',
          String(Math.round((120 * expected.height) / expected.width)),
        )
        await expect(picture).not.toHaveAttribute('sizes')
        expect(decodeURIComponent((await picture.getAttribute('src')) ?? '')).toContain(
          expected.src,
        )
      },
    )
  }

  test('the picture stands centred above the title, 120 px wide on every screen', async ({
    page,
  }) => {
    await gotoReady(page, '/texts/yoga-sutra/')
    const [picture, heading] = await Promise.all([
      headSticker(page).boundingBox(),
      page.getByRole('heading', { level: 1 }).boundingBox(),
    ])
    if (!picture || !heading) throw new Error('The page head is laid out.')
    expect(picture.width).toBe(120)
    expect(picture.y + picture.height, 'above the title').toBeLessThanOrEqual(heading.y)
    expect(
      Math.abs(picture.x + picture.width / 2 - (heading.x + heading.width / 2)),
      'centred on the title',
    ).toBeLessThanOrEqual(1)
  })

  test(
    'the picture stays still while the pointer is on the page',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/texts/yoga-sutra/')
      await page.getByRole('heading', { level: 1 }).hover()
      await expect(headSticker(page)).toHaveCSS('transform', 'none')
    },
  )
})

/** The picture a route's head should show, from the registry; nothing where the page has none. */
async function headPicture({ kind, path }: RouteEntry): Promise<ArtRecord | undefined> {
  const slug = path.split('/').at(-2) ?? ''
  const section = (key: SectionKey) => artFor({ kind: 'section', key })
  switch (kind) {
    case 'concepts':
      return section('concepts')
    case 'concept-map':
      return section('map')
    case 'texts':
      return section('texts')
    case 'questionnaires':
      return section('questionnaires')
    case 'library':
      return section('library')
    case 'references':
      return section('references')
    case 'start':
      return section('start')
    case 'search':
      return section('search')
    case 'resource-list':
    case 'page':
      return section(slug as SectionKey)
    case 'topic':
      return artFor({ kind: 'topic', slug })
    case 'work':
      return artFor({ kind: 'work', slug })
    case 'concept': {
      const concept = await concepts.get(slug)
      if (!concept) throw new Error(`No Concept has the slug “${slug}”.`)
      return artFor({ kind: 'concept', slug, topic: concept.topic.slug })
    }
    case 'questionnaire': {
      const questionnaire = await questionnaires.get(slug)
      if (!questionnaire) throw new Error(`No Questionnaire has the slug “${slug}”.`)
      return artFor({ kind: 'questionnaire', slug, firstConcept: questionnaire.concepts[0]?.slug })
    }
    // The homepage's picture stands beside its motto, not in a page head.
    case 'home':
    case 'questionnaire-flow':
    case 'proposals':
    case 'log-in':
    case 'sign-up':
    case 'privacy':
    case 'credits':
    case 'credits-sources':
      return undefined
  }
}

test.describe('every page, whatever has been made so far', () => {
  for (const route of ROUTES_IN_SCOPE) {
    test(
      `${route.path} shows what the registry gives its head`,
      { tag: '@one-width' },
      async ({ page }) => {
        await gotoReady(page, route.path)
        const expected = await headPicture(route)
        const picture = headSticker(page)
        if (!expected) {
          await expect(picture).toHaveCount(0)
          return
        }
        await expect(picture).toHaveCount(1)
        await expect(picture).toHaveAttribute('alt', '')
        expect(decodeURIComponent((await picture.getAttribute('src')) ?? '')).toContain(
          expected.src,
        )
        await expect
          .poll(() => picture.evaluate((image: HTMLImageElement) => image.naturalWidth))
          .toBeGreaterThan(0)
      },
    )
  }

  /** A card's own picture, read from its address: a Concept's, Traditional text's or Questionnaire's. */
  function cardPicture(href: string): ArtRecord | undefined {
    const [, section, slug = ''] = href.split('/')
    switch (section) {
      case 'concepts':
        return ownArt({ kind: 'concept', slug })
      case 'texts':
        return ownArt({ kind: 'work', slug })
      case 'questionnaires':
        return ownArt({ kind: 'questionnaire', slug })
      default:
        throw new Error(`No card is known for the address “${href}”.`)
    }
  }

  const CARD_LINK = 'a[href^="/concepts/"], a[href^="/texts/"], a[href^="/questionnaires/"]'

  for (const path of ['/', '/start/', '/topics/mind/', '/texts/', '/questionnaires/']) {
    test(
      `on ${path} a card shows its own picture or stays bare`,
      { tag: '@one-width' },
      async ({ page }) => {
        await gotoReady(page, path)
        const titled = page
          .getByRole('main')
          .locator('article:not(:has(h1)):not([data-topic])')
          .filter({ has: page.locator(CARD_LINK) })
        expect(await titled.count(), 'cards on the page').toBeGreaterThan(0)
        for (const card of await titled.all()) {
          const href = await card.locator(CARD_LINK).first().getAttribute('href')
          const expected = cardPicture(href ?? '')
          const picture = card.locator('img')
          await expect(picture, href ?? 'a card').toHaveCount(expected ? 1 : 0)
          if (expected) {
            expect(decodeURIComponent((await picture.getAttribute('src')) ?? '')).toContain(
              expected.src,
            )
          }
        }
      },
    )
  }
})

test.describe('the hero Plate', () => {
  const figure = (page: Page) => page.locator(`figure:has(${HERO})`)

  test(
    'opens the homepage with the first Plate and says which of the seven it is',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/')
      await expect(page.locator(HERO)).toHaveCount(1)
      await expect(page.locator(HERO)).toHaveAttribute('alt', /^A jeweller in a maroon turban/)
      await expect(figure(page).locator('> figcaption:last-child')).toHaveText(
        'The jeweller · 1 of 7',
      )
    },
  )

  test('keeps its ring still as the page scrolls', { tag: '@one-width' }, async ({ page }) => {
    await gotoReady(page, '/')
    const ring = figure(page).locator(`${HERO} ~ svg`)
    expect(await ring.evaluate((svg) => svg.getAnimations({ subtree: true }).length)).toBe(0)
  })

  /** The Medallion the hero Plate sits in, the Folio it stands on, and the heading beside it. */
  async function heroBoxes(page: Page) {
    const heading = page.getByRole('heading', { level: 1 })
    const [medallion, folio, title, motto] = await Promise.all([
      page.locator(HERO).locator('xpath=..').boundingBox(),
      heading.locator('xpath=..').boundingBox(),
      heading.boundingBox(),
      heading.locator('xpath=preceding-sibling::p[1]').boundingBox(),
    ])
    if (!medallion || !folio || !title || !motto) throw new Error('the hero has all four parts')
    return { medallion, folio, title, motto }
  }

  test(
    'from 64rem stands at 360 px in its own column, left of the heading, on a 72rem Folio',
    { tag: '@self-width' },
    async ({ page }) => {
      await gotoReady(page, '/')
      for (const width of [1024, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        const { medallion, title } = await heroBoxes(page)
        expect(medallion.width, `at ${width} px`).toBe(360)
        expect(medallion.height, `at ${width} px`).toBe(360)
        expect(medallion.x + medallion.width, `at ${width} px`).toBeLessThan(title.x)
      }
      const { folio } = await heroBoxes(page)
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
        const { medallion, motto } = await heroBoxes(page)
        expect(medallion.width).toBe(168)
        expect(medallion.y + medallion.height).toBeLessThanOrEqual(motto.y)
        expect(Math.abs(medallion.x + medallion.width / 2 - width / 2)).toBeLessThan(1)
      },
    )
  }

  test('keeps the heading a direct child of the Folio', { tag: '@one-width' }, async ({ page }) => {
    await gotoReady(page, '/')
    await expect(page.locator('[data-paper] > h1')).toHaveCount(1)
  })

  const SIZES = '(min-width: 64rem) 360px, 168px'

  test(
    'is the only picture preloaded, and the only one that sets sizes',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/')
      const preloads = page.locator('head link[rel="preload"][as="image"]')
      await expect(preloads).toHaveCount(1)
      await expect(preloads).toHaveAttribute('imagesizes', SIZES)
      await expect(preloads).toHaveAttribute('imagesrcset', /%2Fart%2Fplates%2Fjeweller\.jpg/)
      const withSizes = page.locator('img[sizes]')
      await expect(withSizes).toHaveCount(1)
      await expect(withSizes).toHaveAttribute('sizes', SIZES)
      await expect(withSizes).toHaveAttribute('data-hero-plate')
    },
  )

  const caption = (page: Page) => figure(page).locator('> figcaption')

  /** The row the viewer's buttons stand in. */
  const controlsRow = (page: Page) => figure(page).locator('[role="group"]')

  test('keeps its button row at full height, with or without the script', async ({
    page,
    browser,
    viewport,
  }) => {
    await gotoReady(page, '/')
    const hydrated = await controlsRow(page).boundingBox()
    expect(hydrated?.height, 'tall enough for a 44 px button').toBeGreaterThanOrEqual(44)
    const captionBox = await caption(page).boundingBox()
    expect(captionBox?.y, 'the caption stands above the row').toBeLessThan(hydrated?.y ?? 0)

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

  const paintings = (page: Page) => page.getByRole('group', { name: 'Paintings' })
  const previous = (page: Page) =>
    paintings(page).getByRole('button', { name: 'Previous painting', exact: true })
  const next = (page: Page) =>
    paintings(page).getByRole('button', { name: 'Next painting', exact: true })

  /** The file of the Plate on top, the one that keeps its alt text. */
  const shownFile = (page: Page) =>
    page.locator(`${HERO}:not([alt=""])`).evaluate((image: HTMLImageElement) => image.currentSrc)

  test('moves through the seven Plates by keyboard alone, and wraps both ways', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    await previous(page).focus()
    await page.keyboard.press('Tab')
    await expect(next(page)).toBeFocused()

    const order = [
      'The sculptor · 2 of 7',
      'The farmers · 3 of 7',
      'The necklace maker · 4 of 7',
      'The bowl painter · 5 of 7',
      'The bird painter · 6 of 7',
      'The planter · 7 of 7',
      'The jeweller · 1 of 7',
    ]
    for (const [step, text] of order.entries()) {
      await page.keyboard.press(step % 2 ? 'Space' : 'Enter')
      await expect(caption(page)).toHaveText(text)
      await expect(next(page), 'focus stays on the button').toBeFocused()
    }

    await page.keyboard.press('Shift+Tab')
    await expect(previous(page)).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(caption(page)).toHaveText('The planter · 7 of 7')
    await expect.poll(() => shownFile(page)).toContain('karma-yoga')
  })

  test('moves by mouse, and every Plate it has shown has loaded', async ({ page }) => {
    await gotoReady(page, '/')
    await next(page).click()
    await expect(caption(page)).toHaveText('The sculptor · 2 of 7')
    await expect.poll(() => shownFile(page)).toContain('sculptor')
    await previous(page).click()
    await previous(page).click()
    await expect(caption(page)).toHaveText('The planter · 7 of 7')
    await expect.poll(() => shownFile(page)).toContain('karma-yoga')
    const widths = await page
      .locator(HERO)
      .evaluateAll((images: HTMLImageElement[]) => images.map((image) => image.naturalWidth))
    expect(widths.every((width) => width > 0)).toBe(true)
  })

  test('moves by touch', { tag: '@one-width' }, async ({ browser, viewport }) => {
    const context = await browser.newContext({ hasTouch: true, viewport })
    const touch = await context.newPage()
    await gotoReady(touch, '/')
    await next(touch).tap()
    await expect(caption(touch)).toHaveText('The sculptor · 2 of 7')
    await context.close()
  })

  test('keeps no hover look after a tap', { tag: '@one-width' }, async ({ browser, viewport }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport })
    const touch = await context.newPage()
    await gotoReady(touch, '/')
    const atRest = await next(touch).evaluate((button) => getComputedStyle(button).borderColor)
    await next(touch).tap()
    await expect(caption(touch)).toHaveText('The sculptor · 2 of 7')
    await expect(next(touch)).toHaveCSS('border-color', atRest)
    await expect(next(touch).locator('svg')).toHaveCSS('transform', 'none')
    await context.close()
  })

  test(
    'names the Plate still on screen when a file fails, and asks for it again next time',
    { tag: '@one-width' },
    async ({ page }) => {
      const sculptor = /url=%2Fart%2Fplates%2Fsculptor\.jpg/
      let fail: () => void = () => undefined
      const failing = new Promise<void>((resolve) => {
        fail = resolve
      })
      await page.route(sculptor, async (route) => {
        await failing
        await route.abort()
      })
      await gotoReady(page, '/')
      const before = await shownFile(page)
      await next(page).click()
      await expect(caption(page)).toHaveText('The sculptor · 2 of 7')
      fail()
      await expect(caption(page)).toHaveText('The jeweller · 1 of 7')
      expect(await shownFile(page)).toBe(before)

      await page.unroute(sculptor)
      await next(page).click()
      await expect(caption(page)).toHaveText('The sculptor · 2 of 7')
      await expect.poll(() => shownFile(page)).toContain('sculptor')
    },
  )

  test('offers two buttons of at least 44 px in a labelled group, and a live caption', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    for (const button of [previous(page), next(page)]) {
      const box = await button.boundingBox()
      expect(box?.width).toBeGreaterThanOrEqual(44)
      expect(box?.height).toBeGreaterThanOrEqual(44)
    }
    await expect(caption(page)).toHaveAttribute('aria-live', 'polite')
  })

  test('stays on its Plate when left alone for 10 s', { tag: '@one-width' }, async ({ page }) => {
    await page.clock.install()
    await gotoReady(page, '/')
    const before = await shownFile(page)
    await page.clock.runFor(10_000)
    await expect(caption(page)).toHaveText('The jeweller · 1 of 7')
    expect(await shownFile(page)).toBe(before)
  })

  /** Start noting which of Plates 2 to 7 the page asks for. Call it before opening the page. */
  function otherPlatesRequested(page: Page) {
    const seen = new Set<string>()
    page.on('request', (request) => {
      const match =
        /url=%2Fart%2Fplates%2F(sculptor|farmers|jeweller-woman|painter-bowl|painter-birds|karma-yoga)\.jpg/.exec(
          request.url(),
        )
      if (match?.[1]) seen.add(match[1])
    })
    return seen
  }

  const NEIGHBOURS = ['karma-yoga', 'sculptor']

  /** Open the homepage, and check it has asked for no Plate but the first and preloaded only that. */
  async function openUntouched(page: Page, requested: Set<string>) {
    await gotoReady(page, '/')
    await page.waitForLoadState('load')
    expect([...requested], 'Plates asked for before any button was touched').toEqual([])
    await expect(page.locator('head link[rel="preload"][as="image"]')).toHaveCount(1)
  }

  test(
    'asks for the neighbouring Plates when a button is hovered, not before',
    { tag: '@one-width' },
    async ({ page }) => {
      const requested = otherPlatesRequested(page)
      await openUntouched(page, requested)
      await next(page).hover()
      await expect.poll(() => [...requested].sort()).toEqual(NEIGHBOURS)
      await expect(page.locator('head link[rel="preload"][as="image"]')).toHaveCount(1)
    },
  )

  test(
    'asks for the neighbouring Plates when a button takes focus, not before',
    { tag: '@one-width' },
    async ({ page }) => {
      const requested = otherPlatesRequested(page)
      await openUntouched(page, requested)
      await next(page).focus()
      await expect.poll(() => [...requested].sort()).toEqual(NEIGHBOURS)
    },
  )

  test('without JavaScript shows the first Plate and its caption, and no buttons', async ({
    browser,
    viewport,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport })
    const bare = await context.newPage()
    await bare.goto('/')
    await expect(bare.locator(HERO)).toBeVisible()
    await expect(caption(bare)).toHaveText('The jeweller · 1 of 7')
    const buttons = controlsRow(bare).locator('button')
    await expect(buttons).toHaveCount(2)
    await expect(buttons.first()).toBeHidden()
    await expect(buttons.last()).toBeHidden()
    await context.close()
  })

  test('moves nothing around it across all seven Plates', async ({ page }) => {
    await gotoReady(page, '/')
    const where = async () => {
      const [title, words] = await Promise.all([
        page.getByRole('heading', { level: 1 }).boundingBox(),
        caption(page).boundingBox(),
      ])
      return { titleY: title?.y, captionHeight: words?.height }
    }
    const before = await where()
    for (let step = 0; step < 7; step++) {
      await next(page).click()
      expect(await where()).toEqual(before)
    }
  })

  /** The Plates with a transition or animation still running for longer than the rule allows. */
  const movingPlates = (page: Page) =>
    page.locator(HERO).evaluateAll((images: HTMLImageElement[]) =>
      images.flatMap((image) =>
        image
          .getAnimations()
          .filter((animation) => {
            const { duration, delay } = animation.effect?.getComputedTiming() ?? {}
            return Number(duration) + Number(delay) > 1
          })
          .map((animation) => (animation as CSSTransition).transitionProperty),
      ),
    )

  test('fades the new Plate in over the old one', async ({ page }) => {
    await gotoReady(page, '/')
    await figure(page).scrollIntoViewIfNeeded()
    // Pressed and read in the page, because the fade is over before a second call could look.
    const fadeStart = await figure(page).evaluate(
      (element: HTMLElement) =>
        new Promise<{ leaving: number; arriving: number; topFirst: string[] }>((resolve) => {
          element.addEventListener('transitionrun', (event) => {
            const arriving = event.target
            if (!(arriving instanceof HTMLImageElement) || !arriving.alt) return
            if (event.propertyName !== 'opacity') return
            const leaving = element.querySelector('img[alt=""]')
            if (!leaving) return
            const { left, top, width, height } = arriving.getBoundingClientRect()
            resolve({
              leaving: Number(getComputedStyle(leaving).opacity),
              arriving: Number(getComputedStyle(arriving).opacity),
              topFirst: document
                .elementsFromPoint(left + width / 2, top + height / 2)
                .filter((found) => found === arriving || found === leaving)
                .map((found) => (found === arriving ? 'arriving' : 'leaving')),
            })
          })
          element.querySelector<HTMLElement>('[aria-label="Next painting"]')?.click()
        }),
    )
    expect(fadeStart.leaving, 'the old Plate stays whole').toBe(1)
    expect(fadeStart.arriving, 'the new Plate is still fading in').toBeLessThan(1)
    expect(fadeStart.topFirst).toEqual(['arriving', 'leaving'])
  })

  test(
    'swaps at once under reduced motion, with nothing moving',
    { tag: '@one-width' },
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoReady(page, '/')
      await next(page).click()
      await expect(caption(page)).toHaveText('The sculptor · 2 of 7')
      await expect.poll(() => shownFile(page)).toContain('sculptor')
      expect(await movingPlates(page)).toEqual([])
    },
  )

  test('passes axe after a press', async ({ page }) => {
    await gotoReady(page, '/')
    await next(page).click()
    await expect(caption(page)).toHaveText('The sculptor · 2 of 7')
    await expect
      .poll(() =>
        figure(page).evaluate((element) =>
          element
            .getAnimations({ subtree: true })
            .every((animation) => animation.playState !== 'running'),
        ),
      )
      .toBe(true)
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

test.describe('the credits gallery', () => {
  /** Words that say where a picture came from, which belong only on the plain list of sources. */
  const WHERE_FROM = /licen[cs]e|origin|source|credit|care4mind website|recraft/i

  test('shows every picture, each with the record’s alt', async ({ page }) => {
    await gotoReady(page, '/credits/')
    const main = page.locator('main')
    await expect(main.locator('figure')).toHaveCount(RECORDS.length)
    const alts = await main
      .locator('figure img')
      .evaluateAll((images) => images.map((image) => image.getAttribute('alt')))
    expect(alts.sort()).toEqual(RECORDS.map(({ alt }) => alt).sort())
  })

  test('captions only the pictures that have a caption, in the record’s words', async ({
    page,
  }) => {
    await gotoReady(page, '/credits/')
    const captions = await page.locator('main figcaption').allInnerTexts()
    expect(captions.sort()).toEqual(RECORDS.flatMap(({ caption }) => caption ?? []).sort())
  })

  test('says nothing about where a picture came from beside it', async ({ page }) => {
    await gotoReady(page, '/credits/')
    const main = page.locator('main')
    // The title says "credits" and the last link says where the pictures come from, so the
    // sections and figures take the full list, and the whole of main the words those two lack.
    for (const text of await main.locator('section, figure').allInnerTexts()) {
      expect(text).not.toMatch(WHERE_FROM)
    }
    await expect(main).not.toContainText(
      /licen[cs]e|origin|care4mind website|recraft|reuse confirmation/i,
    )
  })

  test('ends with its one link, to the plain list of sources', async ({ page }) => {
    await gotoReady(page, '/credits/')
    const last = page.locator('main').getByRole('link').last()
    await expect(last).toHaveText('Where these pictures come from')
    await expect(last).toHaveAttribute('href', '/credits/sources/')
  })

  test('its link is at least 44 px tall', async ({ page }) => {
    await gotoReady(page, '/credits/')
    const box = await page.locator('main').getByRole('link').last().boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
  })

  test('passes axe', async ({ page }) => {
    await gotoReady(page, '/credits/')
    await expectNoAxeViolations(page)
  })
})

test.describe('the plain list of sources', () => {
  test('gives every picture’s origin and licence, and shows no picture', async ({ page }) => {
    await gotoReady(page, '/credits/sources/')
    const main = page.locator('main')
    await expect(main.getByRole('heading', { level: 1 })).toHaveText(
      'Where these pictures come from',
    )
    const entries = await main.locator('ul > li').allInnerTexts()
    expect(entries).toHaveLength(RECORDS.length)
    RECORDS.forEach((record, index) => {
      expect(entries[index], record.id).toContain(originLine(record.origin))
      expect(entries[index], record.id).toContain(record.licence)
    })
    await expect(main.locator('img')).toHaveCount(0)
    // A Plate goes by its caption and a Sticker, which has none, by its alt text.
    await expect(main).toContainText('The jeweller')
    await expect(main).toContainText('Interlocking gears inside a patterned mandala')
  })

  test('passes axe', async ({ page }) => {
    await gotoReady(page, '/credits/sources/')
    await expectNoAxeViolations(page)
  })
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
        // One of the three has no Devanagari, and its rows must not ride up beside the others.
        const chips = featured.locator('[data-topic]')
        expect(new Set(await tops(chips)).size, 'their topic chips level').toBe(1)

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

  test(
    'at 768 px the topic cards stand three and two, each row level and of one height',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 900 })
      await gotoReady(page, '/')
      const cards = homeSection(page, TOPICS).locator('article')
      await expect(cards).toHaveCount(5)
      const boxes = await Promise.all((await cards.all()).map((card) => card.boundingBox()))
      const [a, b, c, d, e] = boxes
      if (!a || !b || !c || !d || !e) throw new Error('The five cards are laid out.')
      expect(new Set([a.y, b.y, c.y]).size, 'three in the first row').toBe(1)
      expect(new Set([a.height, b.height, c.height]).size, 'of one height').toBe(1)
      expect(new Set([d.y, e.y]).size, 'two in the second row').toBe(1)
      expect(d.height).toBe(e.height)
      expect(d.y).toBeGreaterThanOrEqual(a.y + a.height)
    },
  )
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

/** The box a picture is drawn in. A Medallion's is its ring's, and the picture is inset from it. */
const ringOf = (picture: Locator) => picture.locator('xpath=..')

test.describe('the homepage, section and topic pages as a set', () => {
  const main = (page: Page) => page.getByRole('main')
  const emblem = 'img[src*="emblem-ring"]'

  const SIZES: {
    name: string
    path: string
    box: (page: Page) => Locator
    wide: number
    narrow: number
    narrowBelow: number
  }[] = [
    {
      name: 'hero Plate',
      path: '/',
      box: (page) => ringOf(page.locator(HERO)),
      wide: 360,
      narrow: 168,
      narrowBelow: 1024,
    },
    {
      name: 'topic Frontispiece',
      path: '/topics/mind/',
      box: (page) => ringOf(headSticker(page)),
      wide: 240,
      narrow: 200,
      narrowBelow: 640,
    },
    {
      name: 'section Sticker',
      path: '/concepts/',
      box: headSticker,
      wide: 112,
      narrow: 88,
      narrowBelow: 640,
    },
    {
      name: 'Sticker on a topic card',
      path: '/',
      box: (page) => cardSticker(page, 'self'),
      wide: 64,
      narrow: 64,
      narrowBelow: 640,
    },
    {
      name: 'Sticker beside What’s on your mind?',
      path: '/',
      box: (page) => homeSection(page, MIND).locator('img'),
      wide: 56,
      narrow: 56,
      narrowBelow: 640,
    },
    {
      name: 'Emblem in Who’s behind this',
      path: '/',
      box: (page) => main(page).locator(emblem),
      wide: 120,
      narrow: 120,
      narrowBelow: 640,
    },
    {
      name: 'footer Emblem',
      path: '/',
      box: (page) => page.getByRole('contentinfo').locator(emblem),
      wide: 72,
      narrow: 72,
      narrowBelow: 640,
    },
  ]

  for (const { name, path, box, wide, narrow, narrowBelow } of SIZES) {
    test(`the ${name} on ${path} is ${wide} px wide, ${narrow} on a narrow screen`, async ({
      page,
    }) => {
      await gotoReady(page, path)
      const expected = (page.viewportSize()?.width ?? 0) < narrowBelow ? narrow : wide
      expect((await box(page).boundingBox())?.width).toBeCloseTo(expected, 0)
    })
  }

  for (const { path, ringed } of [
    { path: '/concepts/', ringed: false },
    { path: '/library/', ringed: false },
    { path: '/texts/', ringed: false },
    { path: '/questionnaires/', ringed: false },
    { path: '/topics/mind/', ringed: true },
    { path: '/topics/self/', ringed: true },
  ]) {
    test(`${path}: the head picture stands as far above the words as on every other head`, async ({
      page,
    }) => {
      await gotoReady(page, path)
      const picture = ringed ? ringOf(headSticker(page)) : headSticker(page)
      const gap = await picture.evaluate((element) => {
        const next = element.nextElementSibling
        if (!next) throw new Error('The words follow the picture.')
        return next.getBoundingClientRect().top - element.getBoundingClientRect().bottom
      })
      expect(gap).toBeCloseTo(28, 0)
    })
  }

  for (const { name, path, controls } of [
    {
      name: 'the viewer’s buttons',
      path: '/',
      controls: (page: Page) => page.locator('[role="group"] button'),
    },
    {
      name: 'the chips under What’s on your mind?',
      path: '/',
      controls: (page: Page) => homeSection(page, MIND).getByRole('link'),
    },
    {
      name: 'the topic cards',
      path: '/',
      controls: (page: Page) => page.locator('article[data-topic]'),
    },
    {
      name: 'the filter chips under the Sticker',
      path: '/concepts/',
      controls: (page: Page) => main(page).locator('button[aria-pressed]'),
    },
    {
      name: 'the switch between book lists',
      path: '/library/textbooks/',
      controls: (page: Page) =>
        page.getByRole('navigation', { name: 'Book lists' }).getByRole('link'),
    },
    {
      name: 'the lines of a page’s contents',
      path: '/library/methods/',
      controls: (page: Page) => main(page).locator('[data-contents] a').filter({ visible: true }),
    },
  ]) {
    test(
      `${path}: ${name} are at least 44 px at 360 px`,
      { tag: '@self-width' },
      async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 800 })
        await gotoReady(page, path)
        const found = await controls(page).all()
        expect(found.length).toBeGreaterThan(0)
        for (const control of found) {
          const box = await control.boundingBox()
          expect(box?.height).toBeGreaterThanOrEqual(44)
          expect(box?.width).toBeGreaterThanOrEqual(44)
        }
      },
    )
  }

  test(
    'Clear filters is at least 44 px tall at 360 px',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 })
      await gotoReady(page, '/concepts/')
      await main(page).locator('button[aria-pressed]').first().click()
      const box = await main(page).getByRole('button', { name: 'Clear filters' }).boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(44)
    },
  )

  test(
    'under reduced motion a hovered topic card still answers, without moving',
    { tag: '@one-width' },
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoReady(page, '/concepts/')
      await expect(cardLink(page, 'self')).toHaveCSS('text-decoration-line', 'none')
      await cardLink(page, 'self').hover()
      await expect(cardLink(page, 'self')).toHaveCSS('text-decoration-line', 'underline')
      await expect(topicCard(page, 'self')).toHaveCSS('transform', 'none')
    },
  )

  test(
    'under reduced motion a pressed Concept card marks the press, without moving',
    { tag: '@one-width' },
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoReady(page, '/')
      const action = page.getByRole('link', { name: 'Read about Vikṣepa' })
      const card = page.getByRole('article').filter({ has: action })
      await action.scrollIntoViewIfNeeded()
      const atRest = await card.evaluate((element) => getComputedStyle(element).boxShadow)
      await action.hover()
      await page.mouse.down()
      await expect
        .poll(() => card.evaluate((element) => getComputedStyle(element).boxShadow))
        .not.toBe(atRest)
      await expect(card).toHaveCSS('transform', 'none')
      // Let go away from the card, so it doesn't navigate.
      await page.mouse.move(1, 1)
      await page.mouse.up()
    },
  )
})

test.describe('the Concept, Questionnaire, text and error pages as a set', () => {
  for (const { path, ringed } of [
    { path: '/concepts/vikshepa/', ringed: VIKSHEPA_RINGED },
    { path: KARMAYOGA_SCALE, ringed: true },
    { path: '/texts/yoga-sutra/', ringed: false },
  ]) {
    test(`${path}: the room under the head picture matches the other reading pages`, async ({
      page,
    }) => {
      await gotoReady(page, path)
      const picture = ringed ? ringOf(headSticker(page)) : headSticker(page)
      const gap = await picture.evaluate((element) => {
        const next = element.nextElementSibling
        if (!next) throw new Error('The words follow the picture.')
        return next.getBoundingClientRect().top - element.getBoundingClientRect().bottom
      })
      const wide = (page.viewportSize()?.width ?? 0) >= 640
      expect(gap).toBeCloseTo(wide ? 28 : 12, 0)
    })
  }

  for (const { path, link } of [
    { path: '/questionnaires/', link: /^About the/ },
    { path: '/texts/', link: /Yoga Sūtra/ },
  ]) {
    test(`${path}: the whole card is the card's link`, async ({ page }) => {
      await gotoReady(page, path)
      const card = page
        .locator('main article:not(:has(article))')
        .filter({ has: page.getByRole('link', { name: link }) })
        .first()
      await card.scrollIntoViewIfNeeded()
      const answers = await card.evaluate((element) => {
        const box = element.getBoundingClientRect()
        const own = element.querySelector('a')
        return [
          [box.left + box.width / 2, box.top + box.height / 2],
          [box.left + 16, box.bottom - 16],
          [box.right - 16, box.top + 16],
        ].map(([x, y]) => document.elementFromPoint(x ?? 0, y ?? 0)?.closest('a') === own)
      })
      expect(answers).toEqual([true, true, true])
    })
  }

  test('a focused Questionnaire card rings the whole card', async ({ page }) => {
    await gotoReady(page, '/questionnaires/')
    const card = page.locator('main article article').first()
    const box = await card.boundingBox()
    const ringWidth = await card
      .getByRole('link', { name: /^About the/ })
      .evaluate((element) => Number.parseFloat(getComputedStyle(element, '::after').width))
    expect(ringWidth).toBeCloseTo(box?.width ?? 0, 0)
  })

  for (const kind of ['segment', 'global'] as const) {
    test(`the ${kind} error page gives its Emblem the 404's room`, async ({ page }) => {
      await gotoErrorPage(page, kind)
      const gap = await page
        .locator('main img')
        .first()
        .evaluate((element) => {
          const next = element.nextElementSibling
          if (!next) throw new Error('The words follow the Emblem.')
          return next.getBoundingClientRect().top - element.getBoundingClientRect().bottom
        })
      expect(gap).toBeCloseTo(32, 0)
    })
  }

  const CHIP = /^I can.t focus$/

  test(
    'a pressed starting point on the 404 presses in',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, MISSING)
      await page.getByRole('link', { name: CHIP }).hover()
      await page.mouse.down()
      await expect(page.getByRole('link', { name: CHIP })).toHaveCSS(
        'transform',
        'matrix(1, 0, 0, 1, 0, 1)',
      )
      await page.mouse.move(1, 1)
      await page.mouse.up()
    },
  )

  test(
    'under reduced motion a pressed starting point stays put',
    { tag: '@one-width' },
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoReady(page, MISSING)
      await page.getByRole('link', { name: CHIP }).hover()
      await page.mouse.down()
      await expect(page.getByRole('link', { name: CHIP })).toHaveCSS('transform', 'none')
      await page.mouse.move(1, 1)
      await page.mouse.up()
    },
  )
})
