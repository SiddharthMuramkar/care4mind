import type { Locator, Page } from '@playwright/test'

import {
  animationsStartedOn,
  delaysStartedOn,
  isDrawing,
  openingFolio,
  recordAnimationStarts,
  type Start,
} from './drawings'
import { home, topics } from '@/content'

import { expect, gotoReady, test } from './fixtures'
import { focusRingContrast } from './focus-ring'
import { isBreath } from './lotuses'
import { placeOnScreen, scrollPath } from './scrolling'

const section = (page: Page, name: string) => page.getByRole('region', { name, exact: true })

/** The lotus Fleuron printed in the opening folio. */
const heroFleuron = (page: Page) => openingFolio(page).locator('svg[data-lotus]')

/**
 * What has started on a drawing or any part of it since the page began: how long after being
 * set going each began and how long it runs, in ms, its name and whether it loops. Call
 * recordAnimationStarts before loading the page.
 */
const startsIn = (drawing: Locator) =>
  drawing.evaluate((svg) =>
    (window as unknown as { __animationStarts: Start[] }).__animationStarts
      .filter(({ target }) => svg.contains(target))
      .map(({ name, delay, duration, loops }) => ({ name, delay, duration, loops })),
  )

/** The one ornament in the gap between two sections: its outermost element hidden from assistive technology. */
async function ornamentBetween(page: Page, above: Locator, below: Locator) {
  const top = await above.boundingBox()
  const bottom = await below.boundingBox()
  if (!top || !bottom) throw new Error('both sections must be on the page')
  const between: Locator[] = []
  const decoration = page
    .getByRole('main')
    .locator('[aria-hidden="true"]:not([aria-hidden="true"] *)')
  for (const ornament of await decoration.all()) {
    const box = await ornament.boundingBox()
    if (box && box.y >= top.y + top.height && box.y + box.height <= bottom.y) between.push(ornament)
  }
  expect(between, 'one ornament between the sections').toHaveLength(1)
  return between[0] as Locator
}

/**
 * The rules of an OrnamentRule as drawn on screen, left to right: where each
 * starts and ends across the screen, and how much of its full width is inked.
 */
function rulesOf(ornament: Locator) {
  return ornament.evaluate((element) =>
    [...element.children]
      .filter((child): child is HTMLElement => child instanceof HTMLElement)
      .map((rule) => {
        const { left, right, width } = rule.getBoundingClientRect()
        return { left, right, inked: width / rule.offsetWidth }
      })
      .sort((a, b) => a.left - b.left),
  )
}

test.describe('the opening folio', () => {
  test('its lotus Fleuron draws itself once on load, stroke by stroke, ends complete, then breathes once', async ({
    page,
  }) => {
    await recordAnimationStarts(page)
    await gotoReady(page, '/')
    const fleuron = heroFleuron(page)
    await expect(fleuron).toBeVisible()
    await expect(fleuron).toHaveAttribute('aria-hidden', 'true')
    // The hero Plate is the one picture that speaks; the rest stay out of the way.
    await expect(page.getByRole('main').getByRole('img')).toHaveCount(1)
    await expect(
      page.getByRole('main').getByRole('img', { name: /^A jeweller in a maroon turban/ }),
    ).toBeVisible()
    await expect(page.locator('main img:not([data-hero-plate])[alt]:not([alt=""])')).toHaveCount(0)
    await expect(page.locator('main img:not([width]), main img:not([height])')).toHaveCount(0)
    const strokes = await fleuron.locator('path').all()
    expect(strokes.length, 'drawn in more than one stroke').toBeGreaterThan(1)
    for (const stroke of strokes) {
      await expect.poll(() => isDrawing(stroke)).toBe(false)
      await expect(stroke).toHaveCSS('stroke-dashoffset', '0px')
    }

    // Scrolling away and back draws nothing new.
    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }))
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(100)
    for (const stroke of strokes) {
      expect(await isDrawing(stroke)).toBe(false)
      await expect(stroke).toHaveCSS('stroke-dashoffset', '0px')
      expect(await animationsStartedOn(stroke), 'drawn once, in time').toEqual([
        { byScroll: false, duration: expect.any(Number) },
      ])
    }
    // Stroke by stroke: the strokes set off one after another, not all at once.
    const delays = await Promise.all(strokes.map((stroke) => delaysStartedOn(stroke)))
    expect(new Set(delays.flat()).size).toBeGreaterThan(1)

    // Then it breathes once: the breath sets off as the drawing ends, never while it is still drawing.
    await expect
      .poll(async () => (await startsIn(fleuron)).some(({ name }) => isBreath(name)), 'it breathes')
      .toBe(true)
    const starts = await startsIn(fleuron)
    const drawing = starts.filter(({ name }) => !isBreath(name))
    const drawnBy = Math.max(...drawing.map(({ delay, duration }) => delay + (duration ?? 0)))
    for (const { delay, loops } of starts.filter(({ name }) => isBreath(name))) {
      expect(delay, 'the breath sets off once the drawing is done').toBeGreaterThanOrEqual(drawnBy)
      expect(loops, 'and breathes once').toBe(false)
    }
  })

  test('never makes the verse wait: the heading and translation are never hidden or faded in', async ({
    page,
  }) => {
    await recordAnimationStarts(page)
    await gotoReady(page, '/')
    const heading = page.getByRole('heading', { level: 1 })
    const translation = page.getByText('As are the thoughts, so are the manifestations.')
    for (const text of [heading, translation]) {
      await expect(text).toBeVisible()
      await expect(text).toHaveCSS('opacity', '1')
      // Nothing has animated the text, or anything round it, since the page began.
      expect(await animationsStartedOn(text, { orAncestors: true })).toEqual([])
    }
  })

  test('sits on the ruled ground with nothing drawn round it, and nothing drifts as the page scrolls', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    const hero = page.getByRole('region').filter({ has: page.getByRole('heading', { level: 1 }) })
    await expect(hero.locator('svg'), 'the only drawing is in the folio').toHaveCount(
      await openingFolio(page).locator('svg').count(),
    )
    const parts = [openingFolio(page), heroFleuron(page), hero]
    const tops = () => Promise.all(parts.map(async (part) => (await part.boundingBox())?.y ?? NaN))
    const before = await tops()
    await page.evaluate(() => window.scrollBy({ top: 240, behavior: 'instant' }))
    await page.evaluate(
      () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
    )
    const after = await tops()
    expect(before.map((top, index) => top - (after[index] ?? NaN))).toEqual([240, 240, 240])
  })

  test('is never the largest contentful paint', async ({ page }) => {
    await gotoReady(page, '/')
    const largest = await page.evaluate(
      () =>
        new Promise<{ inDrawing: boolean; text: string; isFirstPlate: boolean }>((resolve) => {
          new PerformanceObserver((list) => {
            const element = (list.getEntries().at(-1) as LargestContentfulPaint | undefined)
              ?.element
            resolve({
              inDrawing: Boolean(element?.closest('svg')),
              text: element?.textContent?.trim() ?? '',
              isFirstPlate: Boolean(element?.matches('[data-hero-plate]')),
            })
          }).observe({ type: 'largest-contentful-paint', buffered: true })
        }),
    )
    expect(largest.inDrawing).toBe(false)
    expect(largest.text !== '' || largest.isFirstPlate, 'text or the first Plate').toBe(true)
  })
})

test('an OrnamentRule between each pair of sections inks in from the centre as it scrolls into view', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const neighbours: [string, string][] = [
    ['What’s on your mind?', 'Explore by topic'],
    ['Explore by topic', 'Start with these'],
    ['Start with these', 'How it works'],
    ['How it works', 'Who’s behind this'],
  ]
  for (const [above, below] of neighbours) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    const ornament = await ornamentBetween(page, section(page, above), section(page, below))
    await expect(ornament).toHaveAttribute('aria-hidden', 'true')
    await expect(ornament).not.toBeInViewport()
    const before = await rulesOf(ornament)
    expect(before, 'two rules, one each side of the fleuron').toHaveLength(2)
    for (const rule of before)
      expect(rule.inked, 'short before it reaches the screen').toBeLessThan(0.1)

    await placeOnScreen(ornament, 0.85)
    const partWay = await rulesOf(ornament)
    for (const rule of partWay) {
      expect(rule.inked, 'part-way in on the way up').toBeGreaterThan(0.1)
      expect(rule.inked).toBeLessThan(0.95)
    }

    await placeOnScreen(ornament, 0.2)
    await expect
      .poll(async () => (await rulesOf(ornament)).map(({ inked }) => inked))
      .toEqual([1, 1])
    const full = await rulesOf(ornament)

    // From the centre: the rules' inner ends, beside the fleuron, stay put while their outer ends reach out.
    const [left, right] = [partWay[0], partWay[1]]
    const [fullLeft, fullRight] = [full[0], full[1]]
    if (!left || !right || !fullLeft || !fullRight) throw new Error('two rules')
    expect(Math.abs(right.left - left.right - (fullRight.left - fullLeft.right))).toBeLessThan(1)
    expect(left.left).toBeGreaterThan(fullLeft.left)
    expect(right.right).toBeLessThan(fullRight.right)
  }
})

test('below the hero it shows what is on your mind, topics, featured Concepts, how it works and who is behind it, in order', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 2 })).toHaveText([
    'What’s on your mind?',
    'Explore by topic',
    'Start with these',
    'How it works',
    'Who’s behind this',
  ])
  await expect(section(page, 'Contents')).toHaveCount(0)
  await expect(section(page, 'Questionnaires')).toHaveCount(0)
  await expect(main).not.toContainText('›')

  const topicCards = await topics.list()
  const byTopic = section(page, 'Explore by topic')
  await expect(byTopic.getByRole('listitem')).toHaveCount(topicCards.length)
  for (const topic of topicCards) {
    const card = byTopic.getByRole('listitem').filter({ hasText: topic.name })
    await expect(card.getByRole('link', { name: topic.name })).toHaveAttribute('href', topic.href)
    await expect(card).toContainText(
      `${topic.conceptCount} ${topic.conceptCount === 1 ? 'Concept' : 'Concepts'}`,
    )
  }

  const { featured, closing } = await home.get()
  const startWith = section(page, 'Start with these')
  await expect(startWith.getByRole('listitem')).toHaveCount(featured.length)
  for (const concept of featured) {
    const card = startWith.getByRole('listitem').filter({ hasText: concept.name })
    await expect(card.getByRole('link', { name: `Read about ${concept.name}` })).toHaveAttribute(
      'href',
      concept.href,
    )
    await expect(card).toContainText(concept.topic.name)
    await expect(card).toContainText(
      `About ${concept.readingMinutes} ${concept.readingMinutes === 1 ? 'minute' : 'minutes'} to read`,
    )
  }

  await expect(section(page, 'How it works')).not.toBeEmpty()
  await expect(section(page, 'Who’s behind this')).not.toBeEmpty()
  await expect(main).toContainText(closing)
  // While Start here is on, the closing button is Start here, as in the hero.
  await expect(main.getByRole('link', { name: 'Start here' }).last()).toHaveAttribute(
    'href',
    '/start/',
  )
})

test.describe('the opening folio says what the site is', () => {
  test('its H1 is the promise, and the motto is a small label above it', async ({ page }) => {
    await gotoReady(page, '/')
    const folio = openingFolio(page)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Indian psychology, explained simply.',
    )
    await expect(folio.locator('h1 [lang]')).toHaveCount(0)
    await expect(folio.locator('[lang="sa-Deva"]')).toHaveText('यद् भावं तद् भवति')
    await expect(folio.locator('[lang="sa-Latn"]')).toHaveText('yad bhāvaṃ tad bhavati')
  })

  test('leads to Start here, with Browse concepts beside it, and nothing else', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    const folio = openingFolio(page)
    await expect(folio.getByRole('link')).toHaveCount(2)
    await expect(folio.getByRole('link', { name: 'Start here' })).toHaveAttribute('href', '/start/')
    await expect(folio.getByRole('link', { name: 'Browse concepts' })).toHaveAttribute(
      'href',
      '/concepts/',
    )
  })

  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    test(
      `at ${viewport.width}×${viewport.height}, the H1, the subhead and the primary button show without scrolling`,
      { tag: '@self-width' },
      async ({ page }) => {
        await page.setViewportSize(viewport)
        await gotoReady(page, '/')
        const folio = openingFolio(page)
        for (const part of [
          page.getByRole('heading', { level: 1 }),
          folio.getByText(/^Ideas about the mind from India’s traditional texts/),
          // The primary button, whichever the Start here flag makes it.
          folio.getByRole('link').first(),
        ]) {
          await expect(part).toBeInViewport({ ratio: 1 })
        }
      },
    )
  }

  test(
    'at 360×740, the H1 shows without scrolling, under the small Medallion',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 })
      await gotoReady(page, '/')
      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 })
    },
  )
})

test('links to another page open it at once, without gliding from where you were', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const card = page.getByRole('link', { name: 'Read about Vikṣepa' })
  await placeOnScreen(card, 0.5)
  const toConcept = await scrollPath(page, async () => {
    await card.click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Vikṣepa')
  })
  expect(toConcept.at(-1)).toBe(0)
  expect(toConcept.length, 'a jump, not a glide').toBeLessThanOrEqual(3)

  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }))
  const backHome = await scrollPath(page, async () => {
    // The header stays on screen; its logo leads home.
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Care4Mind home', exact: true })
      .click()
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
  })
  expect(backHome.at(-1)).toBe(0)
  expect(backHome.length, 'a jump, not a glide').toBeLessThanOrEqual(3)
})

test('nothing shifts while the ornaments draw and ink in, from load to the foot of the page', async ({
  page,
}) => {
  await page.addInitScript(() => {
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
  await gotoReady(page, '/')
  for (const stroke of await heroFleuron(page).locator('path').all()) {
    await expect.poll(() => isDrawing(stroke)).toBe(false)
  }
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let top = 0; top <= height; top += 300) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), top)
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)))
  }
  const shift = await page.evaluate(() =>
    (window as unknown as { __layoutShifts: number[] }).__layoutShifts.reduce((a, b) => a + b, 0),
  )
  expect(shift).toBeLessThan(0.01)
})

test('under the hero, six everyday starting points each lead to their Concept page', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const { onYourMind } = await home.get()
  const mind = section(page, 'What’s on your mind?')
  await expect(mind.getByRole('listitem')).toHaveCount(6)
  await expect(mind.getByRole('link')).toHaveText(onYourMind.map(({ label }) => label))
  for (const { label, concept } of onYourMind) {
    await expect(mind.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      concept.href,
    )
    expect((await page.request.get(concept.href)).status(), label).toBe(200)
  }
  const [first] = onYourMind
  if (!first) throw new Error('the homepage has a starting point')
  await mind.getByRole('link', { name: first.label, exact: true }).click()
  await expect(page).toHaveURL(first.concept.href)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(first.concept.name)
})

test(
  'at 390×844, the What’s on your mind? chips are within one viewport height of scroll from the top',
  { tag: '@self-width' },
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoReady(page, '/')
    // This build has the chips' flag on; with it off the section goes too, and there is nothing to reach.
    const { onYourMind } = await home.get()
    const chips = section(page, 'What’s on your mind?').getByRole('link')
    await expect(chips).toHaveCount(onYourMind.length)
    expect(onYourMind.length, 'the homepage has chips to reach').toBeGreaterThan(0)

    const hero = page.getByRole('region').filter({ has: page.getByRole('heading', { level: 1 }) })
    const viewportHeight = await page.evaluate(() => window.innerHeight)
    const scrollAtTop = await page.evaluate(() => window.scrollY)
    expect(viewportHeight).toBe(844)

    // boundingBox reads against the viewport, so add the scroll to place each chip on the page.
    const heroBox = await hero.boundingBox()
    if (!heroBox) throw new Error('the hero must be on the page')
    const chipBoxes = []
    for (const chip of await chips.all()) {
      const box = await chip.boundingBox()
      if (!box) throw new Error('every chip must be on the page')
      chipBoxes.push({ top: box.y + scrollAtTop, bottom: box.y + box.height + scrollAtTop })
    }
    const firstChipTop = Math.min(...chipBoxes.map(({ top }) => top))
    const lastChipBottom = Math.max(...chipBoxes.map(({ bottom }) => bottom))
    expect(firstChipTop, 'the chips start below the hero').toBeGreaterThanOrEqual(
      heroBox.y + heroBox.height + scrollAtTop,
    )
    // The scroll that shows the last chip whole: its foot's page position less one screenful.
    const scrollToShowAllChips = lastChipBottom - viewportHeight
    expect(
      scrollToShowAllChips,
      `the chips take ${Math.round(scrollToShowAllChips)} px of scroll to show whole, within one viewport height (${viewportHeight} px)`,
    ).toBeLessThanOrEqual(viewportHeight)

    // One viewport height of scroll from the top, and every chip is whole on screen.
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: 'instant' }),
      scrollAtTop + viewportHeight,
    )
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollAtTop + viewportHeight)
    for (const chip of await chips.all()) {
      await expect(chip).toBeInViewport({ ratio: 1 })
    }
  },
)

test('the homepage card opens the Concept page', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await gotoReady(page, '/')
  await page.getByRole('link', { name: 'Read about Vikṣepa' }).click()
  await expect(page).toHaveURL('/concepts/vikshepa/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Vikṣepa')
  expect(errors).toEqual([])
})

test('the homepage leads on through a topic card to its topic', async ({ page }) => {
  await gotoReady(page, '/')
  const [firstTopic] = await topics.list()
  if (!firstTopic) throw new Error('the site has a topic')
  await section(page, 'Explore by topic').getByRole('link', { name: firstTopic.name }).click()
  await expect(page).toHaveURL(firstTopic.href)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(firstTopic.name)
})

test("a featured Concept card's focus ring contrasts with the colour behind it", async ({
  page,
}) => {
  await gotoReady(page, '/')
  const concept = page.getByRole('link', { name: 'Read about Vikṣepa' })
  expect(await focusRingContrast(page, concept)).toBeGreaterThanOrEqual(3)
})
