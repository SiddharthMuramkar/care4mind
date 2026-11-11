import type { Page } from '@playwright/test'

import { expectTrail } from './breadcrumbs'
import { undrawn } from './drawings'
import { expect, gotoReady, test } from './fixtures'
import { LOGGED_IN } from './login'
import { pageTurns, prefetched, recordPageTurns } from './page-turns'

// The breadcrumbs test below opens a take page, which needs a user who is logged in.
test.use({ storageState: LOGGED_IN })

// Local runs and CI build with the preview flag on, so the KarmaYoga Scale's Start opens
// its flow. Where the flag is off, Start stays disabled and says "In preparation"; the
// flags-off build checks that side.
test.describe('Questionnaire page (FR-05)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/questionnaires/karmayoga-scale/')
  })

  test('sets out purpose and limitations before the start control', async ({ page }) => {
    const purpose = page.getByRole('heading', { name: 'What it is for' })
    const limits = page.getByRole('heading', { name: 'Before you start: its limits' })
    const start = page.getByRole('link', { name: 'Start the Questionnaire' })
    await expect(purpose).toBeVisible()
    await expect(limits).toBeVisible()
    const top = async (locator: typeof start) => (await locator.boundingBox())?.y ?? Infinity
    expect(await top(purpose)).toBeLessThan(await top(start))
    expect(await top(limits)).toBeLessThan(await top(start))
  })

  test('marks the limitations as a draft for the Psychology expert', async ({ page }) => {
    await expect(page.getByText(/Psychology expert has not reviewed/)).toBeVisible()
  })

  test('says where to call for help now, beside its limits', async ({ page }) => {
    const help = page.locator('main [data-help-line]')
    await expect(help).toContainText('not treatment')
    for (const tel of ['tel:14416', 'tel:18008914416', 'tel:112']) {
      await expect(help.locator(`a[href="${tel}"]`)).toHaveCount(1)
    }
  })

  test('says it is a preview, starts its flow, and asks no questions itself', async ({ page }) => {
    await expect(page.getByText('Preview', { exact: true })).toBeVisible()
    await expect(page.getByText(/^Your answers aren[’']t scored yet\.$/)).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Start the Questionnaire' }),
    ).toHaveAccessibleDescription(/^Your answers aren[’']t scored yet\./)
    await expect(page.getByRole('link', { name: 'Start the Questionnaire' })).toHaveAttribute(
      'href',
      '/questionnaires/karmayoga-scale/take/',
    )
    await expect(page.locator('main').locator('input, select, textarea, form')).toHaveCount(0)
  })
})

test.describe('The Karma Yoga cycle', () => {
  const PATH = '/questionnaires/karmayoga-scale/'
  const drawing = (page: Page) => page.locator('#karma-cycle svg')

  /** How many arrows' lines are still to draw, and how many of their heads are still to show. */
  const unfinishedArrows = (page: Page) =>
    drawing(page).evaluate((svg) => {
      const reading = (selector: string, read: (style: CSSStyleDeclaration) => boolean) =>
        [...svg.querySelectorAll(selector)].filter((path) => read(getComputedStyle(path))).length
      return {
        lines: reading(
          '[data-tone] path:first-child',
          ({ strokeDashoffset }) => parseFloat(strokeDashoffset) !== 0,
        ),
        heads: reading('[data-tone] path:last-child', ({ opacity }) => opacity !== '1'),
      }
    })

  test('stands under its heading in the purpose section, named by its title and description', async ({
    page,
  }) => {
    await gotoReady(page, PATH)
    const section = page.getByRole('region', { name: 'What it is for' })
    await expect(
      section.getByRole('heading', { level: 3, name: 'The cycle of action' }),
    ).toBeVisible()
    const picture = section.getByRole('img', { name: /^The Karma Yoga cycle A cycle of action/ })
    await expect(picture).toBeVisible()
    await expect(picture).toHaveAccessibleName(/At the centre: Karmabandha Mochana\.$/)
    await expect(page.locator('#karma-cycle figcaption')).toHaveText(
      'Read it clockwise, from Karmabija.',
    )
  })

  test('opens as a list, with the same steps', async ({ page }) => {
    await gotoReady(page, PATH)
    const list = page.locator('details ol', { hasText: 'Manonigraha' })
    await expect(list).toBeHidden()
    await page.getByText('Read the cycle as a list').click()
    await expect(list).toBeVisible()
    await expect(list.getByRole('listitem')).toHaveCount(7)
    await expect(list.getByRole('listitem').first()).toHaveText(
      'Karmabija (struck through) leads, through Manonigraha, to Dharmabaddha Kama (Desire).',
    )
    await expect(list.locator('s').first()).toBeVisible()
  })

  test(
    'sets every label at 15 px or more on a 360 px phone and where the type steps down',
    { tag: '@self-width' },
    async ({ page }) => {
      for (const width of [360, 544]) {
        await page.setViewportSize({ width, height: 800 })
        await gotoReady(page, PATH)
        const sizes = await drawing(page).evaluate((svg) => {
          const scale = (svg as SVGSVGElement).getScreenCTM()?.a ?? 0
          return [...svg.querySelectorAll('text')].map(
            (text) => parseFloat(getComputedStyle(text).fontSize) * scale,
          )
        })
        expect(sizes).toHaveLength(17)
        for (const size of sizes) expect(size, `at ${width} px`).toBeGreaterThanOrEqual(15)
      }
    },
  )

  test(
    'keeps labels apart and any arrow off them, from a phone up',
    { tag: '@self-width' },
    async ({ page }) => {
      for (const width of [360, 640, 1024]) {
        await page.setViewportSize({ width, height: 800 })
        await gotoReady(page, PATH)
        await page.evaluate(() => document.fonts.ready)
        const clashes = await drawing(page).evaluate((svg) => {
          // A text's box allows for ascenders and descenders no letter here reaches.
          const boxes = [...svg.querySelectorAll('text')].map((text) => {
            const { left, right, top, height } = text.getBoundingClientRect()
            return {
              word: text.textContent,
              left,
              right,
              top: top + height * 0.2,
              bottom: top + height * 0.85,
            }
          })
          // Closer than this, labels on one row read as a single line of words.
          const gap = 8
          const labels = boxes.flatMap((a, index) =>
            boxes
              .slice(index + 1)
              .filter(
                (b) =>
                  a.left < b.right + gap &&
                  b.left < a.right + gap &&
                  a.top < b.bottom &&
                  b.top < a.bottom,
              )
              .map((b) => `${a.word} / ${b.word}`),
          )
          const arrows = [...svg.querySelectorAll<SVGPathElement>('[data-tone] path')].flatMap(
            (path, index) => {
              const toScreen = path.getScreenCTM()
              if (!toScreen) return [`path ${index} has no place on screen`]
              // The heads are rotated, so the scale is the matrix's length, not its a.
              const halfStroke =
                (parseFloat(getComputedStyle(path).strokeWidth) *
                  Math.hypot(toScreen.a, toScreen.b)) /
                2
              const length = path.getTotalLength()
              const points = Array.from({ length: 501 }, (_, step) =>
                path.getPointAtLength((length * step) / 500).matrixTransform(toScreen),
              )
              return boxes
                .filter((box) =>
                  points.some(
                    ({ x, y }) =>
                      x > box.left - halfStroke &&
                      x < box.right + halfStroke &&
                      y > box.top - halfStroke &&
                      y < box.bottom + halfStroke,
                  ),
                )
                .map((box) => `path ${index} / ${box.word}`)
            },
          )
          return [...labels, ...arrows]
        })
        expect(clashes, `at ${width} px`).toEqual([])
      }
    },
  )

  test(
    'draws its arrows one after another as it scrolls through view, and back',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 500 })
      await gotoReady(page, PATH)
      const lines = drawing(page).locator('[data-tone] path:first-child')
      const first = lines.first()
      const fifth = lines.nth(4)
      await expect.poll(() => undrawn(first)).toBeGreaterThan(0)
      // A sixth of the way through the figure's crossing of the window.
      await page.locator('#karma-cycle').evaluate((figure) => {
        const { top, height } = figure.getBoundingClientRect()
        window.scrollBy(0, top - window.innerHeight + (window.innerHeight + height) / 6)
      })
      await expect.poll(() => undrawn(first)).toBe(0)
      expect(await undrawn(fifth)).toBeGreaterThan(0)
      await page
        .locator('#karma-cycle')
        .evaluate((figure) => figure.scrollIntoView({ block: 'center' }))
      await expect.poll(() => undrawn(fifth)).toBe(0)
      await page.evaluate(() => window.scrollTo(0, 0))
      await expect.poll(() => undrawn(first)).toBeGreaterThan(0)
    },
  )

  test(
    'has every arrow drawn when a tall screen shows the whole figure at load',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 1080, height: 1920 })
      await gotoReady(page, PATH)
      await expect(page.locator('#karma-cycle')).toBeInViewport({ ratio: 1 })
      await expect.poll(() => unfinishedArrows(page)).toEqual({ lines: 0, heads: 0 })
    },
  )

  test('prints with every arrow drawn', async ({ page }) => {
    await gotoReady(page, PATH)
    await page.emulateMedia({ media: 'print' })
    await expect.poll(() => unfinishedArrows(page)).toEqual({ lines: 0, heads: 0 })
  })

  test('prints without its picture', async ({ page }) => {
    await gotoReady(page, PATH)
    const picture = page.getByRole('main').locator('header img')
    await expect(picture).toBeVisible()
    await page.emulateMedia({ media: 'print' })
    await expect(picture).toBeHidden()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test(
    'strikes each struck word from end to end, through its middle',
    { tag: '@self-width' },
    async ({ page }) => {
      for (const width of [360, 1024]) {
        await page.setViewportSize({ width, height: 800 })
        await gotoReady(page, PATH)
        await page.evaluate(() => document.fonts.ready)
        const strikes = await drawing(page).evaluate((svg) =>
          [...svg.querySelectorAll('line')].map((line) => {
            const text = line.previousElementSibling as SVGTextElement
            const word = text.getBoundingClientRect()
            const strike = line.getBoundingClientRect()
            return {
              word: text.textContent,
              before: word.left - strike.left,
              after: strike.right - word.right,
              height: (strike.top - word.top) / word.height,
            }
          }),
        )
        expect(strikes).toHaveLength(3)
        for (const { word, before, after, height } of strikes) {
          const where = `${word} at ${width} px`
          expect(before, `${where}: from its start`).toBeGreaterThan(-1)
          expect(before, `${where}: not far past its start`).toBeLessThan(4)
          expect(after, `${where}: to its end`).toBeGreaterThan(-1)
          expect(after, `${where}: not far past its end`).toBeLessThan(4)
          expect(height, `${where}: below its top`).toBeGreaterThan(0.3)
          expect(height, `${where}: above its foot`).toBeLessThan(0.7)
        }
      }
    },
  )

  test('gives assistive technology its words once, as the picture’s name', async ({ page }) => {
    await gotoReady(page, PATH)
    const session = await page.context().newCDPSession(page)
    const { nodes } = await session.send('Accessibility.getFullAXTree')
    const byId = new Map(nodes.map((node) => [node.nodeId, node]))
    const picture = nodes.find(
      ({ role, name }) =>
        role?.value === 'image' && String(name?.value).startsWith('The Karma Yoga cycle'),
    )
    expect(picture, 'the picture is in the accessibility tree').toBeDefined()
    expect(picture?.description?.value ?? '', 'no description repeating the name').toBe('')
    const below = (ids: string[] = []): typeof nodes =>
      ids.flatMap((id) => {
        const node = byId.get(id)
        return node ? [node, ...below(node.childIds)] : []
      })
    const spoken = below(picture?.childIds).filter(
      ({ ignored, role }) => !ignored && role?.value === 'StaticText',
    )
    expect(
      spoken.map(({ name }) => name?.value),
      'no label repeated beneath it',
    ).toEqual([])
  })
})

// The flow itself is checked in questionnaire-flow.spec.ts; these cover the index.
test.describe('Questionnaires page', () => {
  /** The 16 description pages' Questionnaires and the Dosha Survey, at their anchors. */
  const LATER = [
    'ahimsa',
    'asteya',
    'atma-bandhu',
    'brahma-vihara',
    'brahmacharya',
    'chittabhumi',
    'dosha-survey',
    'five-steps-of-perfection',
    'karta',
    'momentum-of-spiritual-practice',
    'panch-klesha',
    'satya',
    'spiritual-practitioner',
    'sthitaprajna',
    'triguna',
    'upa-vikshepa',
    'vikshepa',
  ]

  test('features the KarmaYoga Scale first, as a preview', async ({ page }) => {
    await page.goto('/questionnaires/')
    const first = page.locator('main article article').first()
    await expect(first.getByRole('heading', { level: 3 })).toHaveText('KarmaYoga Scale')
    await expect(first.getByText('Preview', { exact: true })).toBeVisible()
  })

  test('groups the 17 in preparation by topic, each with its anchor, title, status and Concept', async ({
    page,
  }) => {
    await page.goto('/questionnaires/')
    const later = page.getByRole('region', { name: 'In preparation' })
    expect(await later.getByRole('heading', { level: 3 }).count()).toBeGreaterThan(1)
    const slips = later.locator('li[id]')
    expect((await slips.evaluateAll((items) => items.map(({ id }) => id))).sort()).toEqual(LATER)
    for (const slip of await slips.all()) {
      await expect(slip.getByRole('heading', { level: 4 })).toHaveText(/\S/)
      await expect(slip.getByText('In preparation', { exact: true })).toBeVisible()
      await expect(slip.getByRole('link').first()).toHaveAttribute(
        'href',
        /^\/concepts\/[a-z-]+\/$/,
      )
    }
    await expect(page.locator('#dosha-survey').getByRole('heading', { level: 4 })).toBeVisible()
  })

  test('marks the slip an old address leads to', async ({ page }) => {
    await page.goto('/questionnaires/#dosha-survey')
    await expect(page.locator('#dosha-survey')).toBeInViewport()
  })

  test('the KarmaYoga card flies into its page’s title', async ({ page }) => {
    await recordPageTurns(page)
    await gotoReady(page, '/questionnaires/')
    const card = page.getByRole('link', { name: 'About the KarmaYoga Scale' })
    await prefetched(card)
    await card.click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarmaYoga Scale')
    const [turn] = await pageTurns(page)
    expect(turn?.flights.map(({ name }) => name)).toContain('questionnaire-title-karmayoga-scale')
  })
})

test('names each Questionnaire page’s place in its breadcrumbs', async ({ page }) => {
  for (const [path, trail] of [
    ['/questionnaires/', ['Go to home', 'Questionnaires']],
    ['/questionnaires/karmayoga-scale/', ['Go to home', 'Questionnaires', 'KarmaYoga Scale']],
    [
      '/questionnaires/karmayoga-scale/take/',
      ['Go to home', 'Questionnaires', 'KarmaYoga Scale', 'Take it'],
    ],
  ] as const) {
    await page.goto(path)
    await expectTrail(page, trail, path)
  }
})
