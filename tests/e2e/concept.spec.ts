import type { Locator, Page } from '@playwright/test'

import { CLOSE_DELAY, OPEN_DELAY } from '@/components/preview'
import { concepts, topics } from '@/content'

import { expectNoAxeViolations } from './axe'
import { recordAnimationStarts, transitionedOn } from './drawings'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { expectPageTurned, pageTurns, prefetched, recordPageTurns } from './page-turns'
import { ROUTES_IN_SCOPE } from './routes'

/** The page's title block: its name, gloss, topics, reading time and plain spellings. */
const titleBlock = (page: Page) => page.locator('header').filter({ has: page.locator('h1') })

/** Linked knowledge's rows that join an entry to its note: all but the References. */
async function vikshepaRowsWithRules() {
  const linkedKnowledge = (await concepts.get('vikshepa'))?.linked
  return (
    (linkedKnowledge?.related.length ?? 0) +
    (linkedKnowledge?.works.length ?? 0) +
    (linkedKnowledge?.sections.length ?? 0) +
    (linkedKnowledge?.questionnaires.length ?? 0)
  )
}

/** The References: a native disclosure, the summary that names them and opens it, and their list. */
function references(page: Page) {
  const toggle = page.locator('summary', { hasText: 'References' })
  const disclosure = page.locator('details', { has: toggle })
  return { toggle, disclosure, list: disclosure.getByRole('list') }
}

test.describe('Concept page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
  })

  test(
    'names the term in IAST and Devanagari, each with its language tag',
    { tag: '@one-width' },
    async ({ page }) => {
      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading).toHaveAccessibleName('Vikṣepa विक्षेप')
      await expect(heading.locator('[lang="sa-Latn"]')).toHaveText('Vikṣepa')
      await expect(heading.locator('[lang="sa-Deva"]')).toHaveText('विक्षेप')
      expect(await page.locator('main [lang="sa-Deva"]').count()).toBeGreaterThan(5)
    },
  )

  test(
    'shows the other spellings as plain text in the title block, behind no button',
    { tag: '@one-width' },
    async ({ page }) => {
      const alsoWritten = titleBlock(page).getByText('Also written:')
      await expect(alsoWritten).toBeVisible()
      await expect(alsoWritten).toContainText('viksepa, Vikshepa')
      await expect(page.getByRole('button', { name: /Also spelled|Also written/ })).toHaveCount(0)
      await expectNoAxeViolations(page)
    },
  )

  test(
    'names its topic and how long it takes to read under its title',
    { tag: '@one-width' },
    async ({ page }) => {
      await expect(titleBlock(page)).toContainText('Mind: states and obstacles')
      await expect(titleBlock(page)).toContainText(/About \d+ minutes? to read/)
    },
  )

  test('folds the References away and opens them on request (FR-03)', async ({ page }) => {
    const { toggle: trigger, disclosure } = references(page)
    await expect(disclosure).not.toHaveAttribute('open')
    await trigger.click()
    await expect(disclosure).toHaveAttribute('open')
    const entries = page.locator('[id^="ref-"]')
    await expect(entries).toHaveCount(10)
    await expect(
      page.getByRole('link', { name: 'doi:10.3389/fpsyg.2025.1554014' }),
    ).toHaveAttribute('href', 'https://doi.org/10.3389/fpsyg.2025.1554014')
    // From the top: axe counts only the part of a target not scrolled under the sticky header.
    await page.evaluate(() => window.scrollTo(0, 0))
    await expectNoAxeViolations(page)
  })

  test('a link on the page to one of its References opens them at that entry (FR-03)', async ({
    page,
  }) => {
    const entry = page.locator('#ref-bhavanani-2012')
    await expect(entry).toBeHidden()
    await gotoReady(page, '/concepts/vikshepa/#ref-bhavanani-2012')
    await expect(entry).toBeVisible()
    await expect(entry).toBeInViewport()
  })

  test('a link from another page to one of its References opens them at that entry', async ({
    page,
  }) => {
    await gotoReady(page, '/questionnaires/karmayoga-scale/')
    await gotoReady(page, '/concepts/vikshepa/#ref-gurubhaktananda-2018')
    const entry = page.locator('#ref-gurubhaktananda-2018')
    await expect(entry).toBeVisible()
    await expect(entry).toBeInViewport()
  })

  test('reaches its related Questionnaire in one click (FR-01)', async ({ page }) => {
    await page.getByRole('link', { name: 'KarmaYoga Scale' }).click()
    await expect(page).toHaveURL('/questionnaires/karmayoga-scale/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarmaYoga Scale')
  })

  test('keeps the wide comparison table in its own frame', async ({ page }) => {
    const frame = page.getByRole('region', { name: /Comparison between Indian and Western/ })
    await expect(frame).toBeVisible()
    await expect(frame).toHaveAttribute('tabindex', '0')
    await expect(frame.getByRole('row')).toHaveCount(10)
  })
})

// Interaction is an enhancement (user story 43): the native controls work without it.
test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false })

  test('the Concept page still shows the other spellings as plain text', async ({ page }) => {
    await page.goto('/concepts/vikshepa/')
    await expect(titleBlock(page).getByText('Also written:')).toContainText('viksepa, Vikshepa')
  })

  test('the Concept page still opens its References, and a link to one of them', async ({
    page,
  }) => {
    await page.goto('/concepts/vikshepa/#ref-bhavanani-2012')
    const linked = page.locator('#ref-bhavanani-2012')
    await expect(linked).toBeVisible()
    await expect(linked).toBeInViewport()

    await page.goto('/concepts/vikshepa/')
    const doi = page.getByRole('link', { name: 'doi:10.3389/fpsyg.2025.1554014' })
    await expect(doi).toBeHidden()
    await references(page).toggle.click()
    await expect(doi).toBeVisible()

    await page.getByRole('link', { name: 'KarmaYoga Scale' }).click()
    await expect(page).toHaveURL('/questionnaires/karmayoga-scale/')
  })
})

// Arriving by a link, the page is drawn by React in the browser, not from the server's HTML.
test('arriving from the homepage, the other spellings show and the References still open', async ({
  page,
}) => {
  await gotoReady(page, '/')
  await page.getByRole('link', { name: 'Read about Vikṣepa' }).click()
  await expect(page).toHaveURL('/concepts/vikshepa/')
  await expect(titleBlock(page).getByText('Also written:')).toContainText('viksepa, Vikshepa')
  const doi = page.getByRole('link', { name: 'doi:10.3389/fpsyg.2025.1554014' })
  await references(page).toggle.click()
  await expect(doi).toBeVisible()
})

test('the References list fades in as it opens, by opacity alone', async ({ page }) => {
  await recordAnimationStarts(page)
  await gotoReady(page, '/concepts/vikshepa/')
  const doi = page.getByRole('link', { name: 'doi:10.3389/fpsyg.2025.1554014' })
  const { toggle, list } = references(page)
  await toggle.click()
  await expect(doi).toBeVisible()
  await expect.poll(() => transitionedOn(list)).toEqual(['opacity'])
})

/** How far each of these rules is turned from lying flat, in degrees (0 to 90), as drawn on screen. */
const turns = (rules: Locator) =>
  rules.evaluateAll((elements) =>
    elements
      .map((element) => {
        const { transform } = getComputedStyle(element)
        const matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform)
        return Math.abs(Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI)) % 180
      })
      .sort((a, b) => a - b),
  )

test('the References control shows a plus that folds into a minus as the list opens, and back', async ({
  page,
}) => {
  await recordAnimationStarts(page)
  await gotoReady(page, '/concepts/vikshepa/')
  const { toggle: trigger, disclosure } = references(page)
  // Two vermilion rules, silent to assistive technology.
  const icon = trigger.locator('[aria-hidden="true"]')
  await expect(icon).toHaveCount(1)
  const rules = icon.locator(':scope > *')
  await expect(rules).toHaveCount(2)
  for (const rule of await rules.all()) {
    await expect(rule).toBeVisible()
    await expect(rule).toHaveCSS('background-color', 'rgb(200, 52, 42)')
  }
  expect(await turns(rules), 'a plus while closed').toEqual([0, 90])

  await trigger.click()
  await expect(disclosure).toHaveAttribute('open')
  await expect.poll(() => turns(rules), 'a minus once open').toEqual([0, 0])
  const moved = await Promise.all((await rules.all()).map((rule) => transitionedOn(rule)))
  expect(moved.flat(), 'the upright rule folds flat, by transform').toEqual(['transform'])

  await trigger.click()
  await expect(disclosure).not.toHaveAttribute('open')
  await expect.poll(() => turns(rules), 'a plus again once closed').toEqual([0, 90])
})

// The Concept page.

const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024
const contents = (page: Page) => page.getByRole('navigation', { name: 'Contents' })
const linked = (page: Page) => page.getByRole('region', { name: 'Linked knowledge' })
/** The open preview card: Base UI marks it open and the side it sits on. */
const previewCard = (page: Page) => page.locator('[data-open][data-side]').last()

/** Whether a popup has finished arriving: Base UI has let go of its starting style, and no transition runs. */
const hasSettled = (popup: Locator) =>
  popup.evaluate(
    (element) =>
      !element.hasAttribute('data-starting-style') &&
      element.getAnimations().every((animation) => animation.playState !== 'running'),
  )

/** Wait two frames, for a scroll-driven style to catch up with the scroll. */
const frames = (page: Page) =>
  page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  )

/** How much two boxes overlap, in px². */
function overlap(
  a: { x: number; y: number; width: number; height: number } | null,
  b: { x: number; y: number; width: number; height: number } | null,
) {
  if (!a || !b) return 0
  const width = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
  const height = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
  return width * height
}

test.describe('Concept page lead', () => {
  test(
    'on a 390 px phone "In short" is on the first screen and the first section starts soon after',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await gotoReady(page, '/concepts/vikshepa/')
      const inShort = page.getByRole('heading', { level: 2, name: 'In short' })
      await expect(inShort).toBeInViewport()
      await expect(page.locator('#in-short')).toContainText('nine obstacles')
      const firstSectionTop = await page
        .locator('section#what-is-viksepa')
        .evaluate((section) => section.getBoundingClientRect().top + window.scrollY)
      expect(firstSectionTop).toBeLessThan(1700)
    },
  )

  test(
    'on a phone the breadcrumb is one line back to the Concept’s topic',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await gotoReady(page, '/concepts/vikshepa/')
      const trail = page.getByRole('navigation', { name: 'Breadcrumb', exact: true })
      const topic = trail.getByRole('link', { name: 'Mind: states and obstacles' })
      await expect(topic).toBeVisible()
      await expect(topic).toHaveAttribute('href', '/topics/mind/')
      await expect(trail.getByRole('link')).toHaveCount(1)
      const box = await trail.boundingBox()
      // One line: no taller than its links' own 44 px touch target by more than a breath.
      expect(box?.height ?? 0).toBeLessThanOrEqual(50)
    },
  )

  test(
    'on a wider screen the breadcrumb keeps its whole trail',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await gotoReady(page, '/concepts/vikshepa/')
      const trail = page.getByRole('navigation', { name: 'Breadcrumb', exact: true })
      await expect(trail.getByRole('link', { name: 'Go to home', exact: true })).toBeVisible()
      await expect(trail.locator('[aria-current="page"]')).toHaveText(/Vikṣepa/)
    },
  )

  test(
    'orders its parts: the summary, its Terms, its sections, the texts, Linked knowledge, the References',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/concepts/vikshepa/')
      const order = await page.evaluate(() => {
        const ids = [
          'in-short',
          'at-a-glance',
          'what-is-viksepa',
          'from-the-traditional-texts',
          'linked-knowledge',
          'references',
        ]
        const found = ids.map((id) => document.getElementById(id))
        return found.map((element, index) => {
          const next = found[index + 1]
          if (!element || !next) return Boolean(element)
          return Boolean(element.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING)
        })
      })
      expect(order).toEqual([true, true, true, true, true, true])
      // No why-it-matters line shows until one is supplied.
      await expect(page.locator('#in-short')).not.toContainText('Why it matters')
    },
  )

  test('at a glance links each of its nine Terms to its place in the sections', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const glance = page.getByRole('region', { name: 'At a glance' })
    const links = glance.getByRole('link')
    await expect(links).toHaveCount(9)
    await expect(glance.getByRole('link', { name: /Vyādhi/ })).toHaveAttribute('href', '#vyadhi')
    await expect(glance.getByRole('link', { name: /Vyādhi/ })).toContainText('Illness')
    await glance.getByRole('link', { name: /Saṃśaya/ }).click()
    await expect(page).toHaveURL(/#samsaya$/)
    await expect(page.locator('#samsaya').getByRole('heading', { level: 3 })).toBeInViewport()
  })

  test('a Concept with no Terms has no at-a-glance grid', async ({ page }) => {
    await gotoReady(page, '/concepts/atman/')
    await expect(page.getByRole('heading', { level: 2, name: 'At a glance' })).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 2, name: 'In short' })).toBeVisible()
  })

  test(
    'a Concept with no gloss shows no empty subtitle, and no Devanagari slot without one',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/concepts/brahma-vihara/')
      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading.locator('[lang="sa-Deva"]')).toHaveCount(0)
      await expect(titleBlock(page)).not.toContainText('—')
    },
  )

  test(
    'below the sections, a phone reads the translation first and opens the original on request',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await gotoReady(page, '/concepts/vikshepa/')
      const texts = page.getByRole('region', { name: 'From the traditional texts' })
      const card = texts.locator('figure', { hasText: 'Yoga Sūtra 1.30' }).first()
      await card.scrollIntoViewIfNeeded()
      await expect(card.getByText('Meaning')).toBeVisible()
      const original = card.locator('blockquote [lang="sa-Deva"]')
      await expect(original).toBeHidden()
      await card.getByText('Show original').click()
      await expect(original).toBeVisible()
      await expectNoAxeViolations(page)
    },
  )

  test(
    'on a wide screen every part of a verse below the sections stands open',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await gotoReady(page, '/concepts/vikshepa/')
      const texts = page.getByRole('region', { name: 'From the traditional texts' })
      const card = texts.locator('figure', { hasText: 'Yoga Sūtra 1.30' }).first()
      await card.scrollIntoViewIfNeeded()
      await expect(card.locator('blockquote [lang="sa-Deva"]')).toBeVisible()
      await expect(card.getByText('Show original')).toBeHidden()
      await expect(card.getByText('Meaning')).toBeVisible()
    },
  )
})

test.describe('Concept page v2: heading and blocks', () => {
  test(
    'leads with the capitalised IAST, the Devanagari beside it and the gloss in sentence case',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await gotoReady(page, '/concepts/vikshepa/')
      const heading = page.getByRole('heading', { level: 1 })
      const [iast, deva] = [
        heading.locator('[lang="sa-Latn"]'),
        heading.locator('[lang="sa-Deva"]'),
      ]
      await expect(iast).toHaveText('Vikṣepa')
      await expect(deva).toHaveText('विक्षेप')
      const [left, beside] = [await iast.boundingBox(), await deva.boundingBox()]
      expect(beside?.x ?? 0).toBeGreaterThanOrEqual((left?.x ?? 0) + (left?.width ?? 0) - 1)
      // Beside, not below: the two spellings share a line.
      expect(beside?.y ?? 0).toBeLessThan((left?.y ?? 0) + (left?.height ?? 0))
      expect(left?.y ?? 0).toBeLessThan((beside?.y ?? 0) + (beside?.height ?? 0))
      const gloss = page.locator('header p', { hasText: 'Distraction' })
      await expect(gloss).toHaveCSS('font-variant-caps', 'normal')
      // At reading size, never a small label: at least the title page's own body size.
      expect(
        parseFloat(await gloss.evaluate((element) => getComputedStyle(element).fontSize)),
      ).toBeGreaterThanOrEqual(20)
    },
  )

  test('a Concept with an English title leads with it', async ({ page }) => {
    await gotoReady(page, '/concepts/five-steps-of-perfection/')
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toHaveText(/five steps/i)
    await expect(heading.locator('[lang]')).toHaveCount(0)
  })

  test('each term has a heading a level below its section, an anchor and a visible link to it', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const section = page.locator('section#distraction-at-the-body-level')
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      'Distraction at the body level',
    )
    const term = section.locator('#vyadhi')
    await expect(term.getByRole('heading', { level: 3 })).toContainText('Vyādhi')
    const link = term.getByRole('link', { name: 'Link to Vyādhi' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '#vyadhi')
    await link.click()
    await expect(page).toHaveURL(/#vyadhi$/)
    await expect(term.getByRole('heading', { level: 3 })).toBeInViewport()
  })

  test('labels applications and comparison sections, and no comparison calls two ideas equivalent', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/sthitaprajna/')
    await expect(
      page.getByRole('heading', { level: 2, name: /^Applications: Applications of/ }),
    ).toBeVisible()
    const comparisons = page.locator('section', {
      has: page.getByRole('heading', { level: 2, name: /^Comparison: / }),
    })
    await expect(comparisons).toHaveCount(3)
    for (const comparison of await comparisons.all()) {
      await expect(comparison).not.toContainText(/\bequivalent\b|\bthe same as\b/i)
    }
  })

  test('sets a verse quoted mid-section, the shared topic introduction and a wide table', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/karta/')
    await expect(page.locator('section figure blockquote [lang="sa-Deva"]').first()).toBeVisible()
    await gotoReady(page, '/concepts/ahimsa/')
    await expect(page.getByText('From the introduction to')).toHaveCount(1)
    await expect(page.locator('section').getByRole('region').first()).toBeVisible()
  })
})

test.describe('Concept page v2: contents', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
  })

  test('lists the sections, Linked knowledge and the References in a named navigation', async ({
    page,
  }) => {
    const links = contents(page).getByRole('link')
    await expect(contents(page).getByRole('link', { name: 'In short' })).toHaveAttribute(
      'href',
      '#in-short',
    )
    await expect(contents(page).getByRole('link', { name: 'At a glance' })).toHaveAttribute(
      'href',
      '#at-a-glance',
    )
    await expect(contents(page).getByRole('link', { name: 'What is vikṣepa?' })).toHaveAttribute(
      'href',
      '#what-is-viksepa',
    )
    await expect(
      contents(page).getByRole('link', { name: 'From the traditional texts' }),
    ).toHaveAttribute('href', '#from-the-traditional-texts')
    await expect(contents(page).getByRole('link', { name: 'Linked knowledge' })).toHaveAttribute(
      'href',
      '#linked-knowledge',
    )
    await expect(contents(page).getByRole('link', { name: 'References' })).toHaveAttribute(
      'href',
      '#references',
    )
    expect(await links.count()).toBeGreaterThanOrEqual(9)
    await contents(page).getByRole('link', { name: 'Linked knowledge' }).click()
    await expect(linked(page).getByRole('heading', { level: 2 })).toBeInViewport()
  })

  test('stays in view beside the text on a wide screen, and sits above it unstuck on a narrow one', async ({
    page,
  }) => {
    const nav = contents(page)
    const firstSection = page.locator('section#what-is-viksepa')
    await page.locator('#linked-knowledge').scrollIntoViewIfNeeded()
    await frames(page)
    if (wide(page)) {
      await expect(nav.getByRole('heading', { name: 'Contents' })).toBeInViewport()
      const [toc, text] = [await nav.boundingBox(), await firstSection.boundingBox()]
      expect((toc?.x ?? 0) + (toc?.width ?? 0)).toBeLessThanOrEqual(text?.x ?? 0)
    } else {
      await expect(nav).not.toBeInViewport()
      await page.evaluate(() => window.scrollTo(0, 0))
      const [toc, text] = [await nav.boundingBox(), await firstSection.boundingBox()]
      expect((toc?.y ?? 0) + (toc?.height ?? 0)).toBeLessThanOrEqual(text?.y ?? 0)
    }
  })

  test('marks the section in view, in CSS alone', async ({ page }) => {
    const link = contents(page).getByRole('link', { name: 'Distraction at the body level' })
    const current = () => link.evaluate((element) => element.matches(':target-current'))
    expect(await current()).toBe(false)
    await page
      .locator('section#distraction-at-the-body-level')
      .evaluate((section) => section.scrollIntoView({ block: 'start' }))
    await frames(page)
    await expect.poll(current).toBe(true)
  })
})

test.describe('Concept page v2: linked knowledge', () => {
  test('gathers related Concepts with their reasons, the passages, sections, References and Questionnaire', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const panel = linked(page)
    const related = panel.getByRole('listitem').filter({ hasText: 'Citta-bhūmi' })
    await expect(related.getByRole('link', { name: 'Citta-bhūmi' })).toHaveAttribute(
      'href',
      '/concepts/chittabhumi/',
    )
    await expect(related).toContainText('Both quote Yoga Sūtra 1.30')
    await expect(panel.getByRole('link', { name: 'Yoga Sūtra 1.30' })).toHaveAttribute(
      'href',
      '/texts/yoga-sutra/#1-30',
    )
    await expect(panel.getByRole('link', { name: 'Yoga Sūtra', exact: true })).toHaveAttribute(
      'href',
      '/texts/yoga-sutra/',
    )
    await expect(panel.getByRole('link', { name: 'Indian and Western concepts' })).toHaveAttribute(
      'href',
      '#indian-and-western-concepts',
    )
    await expect(panel.locator('a[href^="#ref-"]')).toHaveCount(10)
    // The Questionnaire, with its status in words beside it (WCAG 1.4.1).
    const questionnaire = panel.getByRole('listitem').filter({ hasText: 'KarmaYoga Scale' })
    await expect(questionnaire.getByRole('link', { name: 'KarmaYoga Scale' })).toHaveAttribute(
      'href',
      '/questionnaires/karmayoga-scale/',
    )
    await expect(questionnaire).toContainText(/Open|Preview|In preparation/)
    // Its rules are decoration, silent to assistive technology.
    const rules = panel.locator('li [aria-hidden="true"]')
    await expect(rules).toHaveCount(await vikshepaRowsWithRules())
    await expectNoAxeViolations(page)
  })

  test('the Questionnaire’s title turns the page forward and flies into its heading', async ({
    page,
  }) => {
    await recordPageTurns(page)
    await gotoReady(page, '/concepts/vikshepa/')
    const link = linked(page).getByRole('link', { name: 'KarmaYoga Scale' })
    await link.scrollIntoViewIfNeeded()
    await prefetched(link)
    await link.click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarmaYoga Scale')
    const [turn] = await pageTurns(page)
    expectPageTurned(turn, 'forward')
    expect(turn?.flights.map(({ name }) => name)).toContain('questionnaire-title-karmayoga-scale')
  })

  test('every Related Concept shows its topic chip and reading time', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const related = (await concepts.get('vikshepa'))?.linked.related ?? []
    expect(related.length).toBeGreaterThan(0)
    for (const other of related) {
      // A Related Concept's link names it in full: Sanskrit name, then gloss.
      const named = other.gloss ? `${other.name} · ${other.gloss}` : other.name
      const row = linked(page)
        .getByRole('listitem')
        .filter({ has: page.getByRole('link', { name: named, exact: true }) })
      const minutes = other.readingMinutes
      await expect(row.locator(`[data-topic="${other.topic.slug}"]`)).toHaveText(other.topic.name)
      await expect(row).toContainText(
        `About ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} to read`,
      )
    }
  })

  test('leaves empty groups out', async ({ page }) => {
    await gotoReady(page, '/concepts/atman/')
    const panel = linked(page)
    await expect(panel.getByRole('heading', { level: 3 })).toHaveText([/^Related Concepts/])
    // The page's own list: the footer's folded Library list names the References page too.
    const main = page.getByRole('main')
    await expect(main.locator('details', { hasText: 'References' })).toHaveCount(0)
  })

  test('its cross-reference rules ink in from the centre as they scroll into view', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const ink = linked(page).locator('li [aria-hidden="true"] > *').last()
    const clip = () => ink.evaluate((element) => getComputedStyle(element).clipPath)
    expect(await clip()).toMatch(/^inset\(0px 50%/)
    await ink.evaluate((element) => element.scrollIntoView({ block: 'center' }))
    await frames(page)
    await expect.poll(clip).toMatch(/^(none|inset\(0px( 0%)?\))$/)
  })

  test('where motion is reduced, the rules are inked in and still', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoReady(page, '/concepts/vikshepa/')
    const inks = linked(page).locator('li [aria-hidden="true"] > *')
    await expect(inks).toHaveCount(await vikshepaRowsWithRules())
    const still = await inks.evaluateAll((elements) =>
      elements.every(
        (element) =>
          getComputedStyle(element).clipPath === 'none' && element.getAnimations().length === 0,
      ),
    )
    expect(still).toBe(true)
  })
})

test.describe('Concept page v2: citations', () => {
  const citation = (page: Page) => page.locator('section a[href="#ref-bhavanani-2012"]').first()

  test('a citation opens the References at its entry and puts focus on it, by keyboard', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const entry = page.locator('#ref-bhavanani-2012')
    await expect(entry).toBeHidden()
    await citation(page).focus()
    await page.keyboard.press('Enter')
    await expect(entry).toBeVisible()
    await expect(entry).toBeFocused()
    await expect(entry).toBeInViewport()
    await expect(references(page).disclosure).toHaveAttribute('open')
    // Clear of the sticky header, which would otherwise cover part of a link: scroll-padding
    // parks the list's control just below it, and instantly, as axe can't scan a moving page.
    await references(page).toggle.evaluate((toggle) =>
      toggle.scrollIntoView({ block: 'start', behavior: 'instant' }),
    )
    await expectNoAxeViolations(page)
  })

  test('a citation opens the References at its entry and puts focus on it, by mouse', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const entry = page.locator('#ref-bhavanani-2012')
    await citation(page).click()
    await expect(entry).toBeFocused()
    await expect(entry).toBeInViewport()
  })

  test('without JavaScript, a citation still reaches its entry', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/concepts/vikshepa/')
    await citation(page).click()
    const entry = page.locator('#ref-bhavanani-2012')
    await expect(entry).toBeVisible()
    await expect(entry).toBeInViewport()
    await context.close()
  })
})

test.describe('Concept page v2: previews', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
  })

  test('a Concept link shows its preview on hover, which the pointer can move onto', async ({
    page,
  }) => {
    const link = linked(page).getByRole('link', { name: 'Citta-bhūmi' })
    await link.scrollIntoViewIfNeeded()
    await page.mouse.move(1, 1)
    await link.hover()
    const card = previewCard(page)
    await expect(card).toContainText('Concept')
    await expect(card).toContainText('Citta-bhūmi')
    const previewed = (await concepts.get('vikshepa'))?.linked.related.find(
      ({ slug }) => slug === 'chittabhumi',
    )
    if (!previewed) throw new Error('Citta-bhūmi is related to Vikṣepa.')
    await expect(card.locator(`[data-topic="${previewed.topic.slug}"]`)).toHaveText(
      previewed.topic.name,
    )
    await expect(card).toContainText(/About \d+ minutes? to read/)
    // A card still rising in makes Playwright's hover retry and scroll, flipping the card away.
    await expect.poll(() => hasSettled(card)).toBe(true)
    await expect
      .poll(async () => overlap(await card.boundingBox(), await link.boundingBox()))
      .toBe(0)
    await card.hover()
    // Still there well past the delay that would close it if the pointer had left.
    await page.waitForTimeout(3 * CLOSE_DELAY)
    await expect(card).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('a citation shows its preview on keyboard focus, beside it, and Escape closes it', async ({
    page,
  }) => {
    const link = page.locator('section a[href^="#ref-"]').first()
    await page.keyboard.press('Shift')
    await link.focus()
    const card = previewCard(page)
    await expect(card).toContainText('Reference')
    await expect
      .poll(async () => overlap(await card.boundingBox(), await link.boundingBox()))
      .toBe(0)
    await page.keyboard.press('Escape')
    await expect(card).toBeHidden()
    await expect(link).toBeFocused()
  })

  test(
    'a verse link shows its translation, and a second preview asks the network for nothing',
    { tag: '@one-width' },
    async ({ page }) => {
      const first = linked(page).getByRole('link', { name: 'Citta-bhūmi' })
      await first.scrollIntoViewIfNeeded()
      await page.mouse.move(1, 1)
      await first.hover()
      await expect(previewCard(page)).toContainText('Citta-bhūmi')
      await page.mouse.move(1, 1)
      await expect(previewCard(page)).toBeHidden()

      // Data the page asks for, not the code or prefetches its links make.
      const requests: string[] = []
      page.on('request', (request) => {
        if (['fetch', 'xhr'].includes(request.resourceType()) && !request.url().includes('_rsc')) {
          requests.push(request.url())
        }
      })
      const verse = linked(page).getByRole('link', { name: 'Yoga Sūtra 1.30' })
      await verse.hover()
      await expect(previewCard(page)).toContainText('Verse')
      await expect(previewCard(page)).toContainText('Yoga Sūtra 1.30')
      expect(requests).toEqual([])
    },
  )

  test('shows nothing on touch', { tag: '@one-width' }, async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true })
    const page = await context.newPage()
    await gotoReady(page, '/concepts/vikshepa/')
    const link = page.locator('section a[href^="#ref-"]').first()
    await link.scrollIntoViewIfNeeded()
    await link.tap()
    // Past the delay that opens a preview for a pointer, nothing has opened.
    await page.waitForTimeout(2 * OPEN_DELAY)
    await expect(page.locator('[data-open][data-side]')).toHaveCount(0)
    await context.close()
  })
})

test.describe('Concept page v2: verse cards', () => {
  test(
    'a chip leads to the passage, and "Copy verse" copies it and says so politely',
    { tag: '@one-width' },
    async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
      await page.clock.install()
      await gotoReady(page, '/concepts/vikshepa/')
      const card = page.locator('figure', { hasText: 'Yoga Sūtra 1.30' }).first().locator('..')
      await expect(card.getByRole('link', { name: 'Yoga Sūtra 1.30' })).toHaveAttribute(
        'href',
        '/texts/yoga-sutra/#1-30',
      )
      const copy = card.getByRole('button', { name: /^Copy verse/ })
      await copy.focus()
      await page.keyboard.press('Enter')
      const copied = await page.evaluate(() => navigator.clipboard.readText())
      const devanagari = (await card.locator('blockquote [lang="sa-Deva"]').innerText()).split(
        '\n',
      )[0]
      expect(copied).toContain(devanagari?.trim().slice(0, 12))
      expect(copied).toContain('Yoga Sūtra 1.30')
      expect(copied).not.toContain('<')

      const notifications = page.getByRole('region', { name: 'Notifications' })
      await expect(notifications).toHaveAttribute('aria-live', 'polite')
      const status = notifications.getByText('Verse copied')
      await expect(status).toBeVisible()
      await expect(notifications.getByText('Yoga Sūtra 1.30')).toHaveAttribute('lang', 'sa-Latn')
      await expect(copy).toBeFocused()
      // Axe reads colours as they are painted, so let the toast finish arriving first.
      await expect
        .poll(() =>
          notifications.evaluate((element) =>
            element
              .getAnimations({ subtree: true })
              .every((animation) => animation.playState !== 'running'),
          ),
        )
        .toBe(true)
      await expectNoAxeViolations(page)

      // Space copies too; its toast stays until just short of 6 seconds, then goes, and focus never moves.
      await page.keyboard.press(' ')
      await expect(status).toHaveCount(2)
      await page.clock.fastForward(5500)
      await expect(status.last()).toBeVisible()
      await page.clock.fastForward(1000)
      await expect(status).toHaveCount(0)
      await expect(copy).toBeFocused()
    },
  )
})

test.describe('Concept page v2: tables', () => {
  test('on a phone a comparison table stacks as cards, each cell under its column’s name', async ({
    page,
  }) => {
    test.skip(page.viewportSize()?.width !== 360, 'comparison tables stack below 48rem')
    await gotoReady(page, '/concepts/vikshepa/')
    const frame = page.getByRole('region', { name: /Comparison between Indian and Western/ })
    await frame.scrollIntoViewIfNeeded()
    // Nothing to scroll sideways: the card fits its frame, and so does the page.
    expect(await frame.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
      true,
    )
    expect(await scrollsSideways(page)).toEqual([])
    const firstRow = frame.locator('tbody tr').first()
    const head = firstRow.locator('th, td').first()
    const cell = firstRow.locator('td').first()
    await expect(head).toContainText('Vyādhi')
    const [headBox, cellBox] = [await head.boundingBox(), await cell.boundingBox()]
    // Stacked: the cell stands under the row's head, on the same left edge.
    expect(cellBox?.y ?? 0).toBeGreaterThanOrEqual((headBox?.y ?? 0) + (headBox?.height ?? 0) - 1)
    expect(Math.abs((cellBox?.x ?? 0) - (headBox?.x ?? 0))).toBeLessThanOrEqual(1)
    // Its column's name heads it.
    const label = await cell.evaluate((element) => getComputedStyle(element, '::before').content)
    expect(label).toContain('Indian psychology')
    await expectNoAxeViolations(page)
  })

  test('above a phone a wide table scrolls in its own named region, its first column staying in view', async ({
    page,
  }) => {
    test.skip(page.viewportSize()?.width !== 768, 'the table is wider than its frame at 768 px')
    await gotoReady(page, '/concepts/vikshepa/')
    const frame = page.getByRole('region', { name: /Comparison between Indian and Western/ })
    await expect(frame).toHaveAttribute('tabindex', '0')
    expect(await frame.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)
    const first = frame.getByRole('row').nth(1).locator('th, td').first()
    const second = frame.getByRole('row').nth(1).locator('th, td').nth(1)
    const [before, beside] = [await first.boundingBox(), await second.boundingBox()]
    // A wheel, not scrollBy: a script can scroll a frame that hides its overflow, a reader can't.
    await frame.hover()
    await page.mouse.wheel(400, 0)
    await expect.poll(() => frame.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
    await expect.poll(async () => (await second.boundingBox())?.x ?? 0).toBeLessThan(beside?.x ?? 0)
    expect((await first.boundingBox())?.x).toBeCloseTo(before?.x ?? 0, 0)
    // Scroll shadows in CSS: shades fixed to the frame, and paper that scrolls with the table.
    const attachment = await frame.evaluate(
      (element) => getComputedStyle(element).backgroundAttachment,
    )
    expect(attachment).toContain('local')
    expect(attachment).toContain('scroll')
    expect(await scrollsSideways(page)).toEqual([])
  })
})

test.describe('Concept page v2: previous and next', () => {
  test('"next" turns the page forward and "previous" turns it back, within the topic', async ({
    page,
  }) => {
    await recordPageTurns(page)
    await gotoReady(page, '/concepts/sthitaprajna/')
    const pager = page.getByRole('navigation', { name: /^Concepts in / })
    const next = pager.getByRole('link', { name: /^Next/ })
    await expect(next).toContainText('Upa-vikṣepa')
    await prefetched(next)
    await next.click()
    await expect(page).toHaveURL('/concepts/upa-vikshepa/')
    // Let the turn finish before the next one starts, which would cut it short.
    const [forward] = await pageTurns(page)
    expectPageTurned(forward, 'forward')
    const previous = page
      .getByRole('navigation', { name: /^Concepts in / })
      .getByRole('link', { name: /^Previous/ })
    await expect(previous).toContainText('Sthitaprajña')
    await prefetched(previous)
    await previous.click()
    await expect(page).toHaveURL('/concepts/sthitaprajna/')
    const [, back] = await pageTurns(page)
    expectPageTurned(back, 'back')
  })

  test('the first Concept of a topic has no "previous", and the last leads on to the next topic instead of a "next"', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/chittabhumi/')
    const pager = page.getByRole('navigation', { name: /^Concepts in / })
    await expect(pager.getByRole('link', { name: /^Previous/ })).toHaveCount(0)
    await expect(pager.getByRole('link', { name: /^Next/ })).toHaveCount(1)
    await expect(pager.getByRole('link', { name: /^Next topic/ })).toHaveCount(0)
    await gotoReady(page, '/concepts/vikshepa/')
    const last = page.getByRole('navigation', { name: /^Concepts in / })
    await expect(last.getByRole('link', { name: /^Previous/ })).toHaveCount(1)
    // Its one way on is the next topic's page, which turns the page forward.
    const onward = last.getByRole('link', { name: /^Next/ })
    await expect(onward).toHaveCount(1)
    await expect(onward).toHaveAccessibleName(/^Next topic/)
    await expect(onward).toContainText('Practice and progress')
    await expect(onward).toHaveAttribute('href', '/topics/practice/')
    await recordPageTurns(page)
    await prefetched(onward)
    await onward.click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Practice and progress')
    expectPageTurned((await pageTurns(page))[0], 'forward')
  })

  test(
    'every Concept page leads to all the Concepts in its topic, and the last in a topic on to the next',
    { tag: '@one-width' },
    async ({ page }) => {
      const all = await topics.list()
      for (const [index, topic] of all.entries()) {
        const inTopic = (await topics.get(topic.slug))?.concepts ?? []
        expect(inTopic.length, topic.slug).toBeGreaterThan(0)
        for (const [at, concept] of inTopic.entries()) {
          await page.goto(concept.href)
          const pager = page.getByRole('navigation', {
            name: `Concepts in ${topic.name}`,
            exact: true,
          })
          await expect(
            pager.getByRole('link', { name: 'All concepts in this topic', exact: true }),
            concept.slug,
          ).toHaveAttribute('href', `${topic.href}#its-concepts`)
          const onward = pager.getByRole('link', { name: /^Next topic/ })
          const nextTopic = at === inTopic.length - 1 ? all[index + 1] : undefined
          if (nextTopic) await expect(onward, concept.slug).toHaveAttribute('href', nextTopic.href)
          else await expect(onward, concept.slug).toHaveCount(0)
        }
      }
    },
  )

  test('"All concepts in this topic" opens the topic at its Concepts', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const all = page
      .getByRole('navigation', { name: /^Concepts in / })
      .getByRole('link', { name: 'All concepts in this topic', exact: true })
    await prefetched(all)
    await all.click()
    await expect(page).toHaveURL('/topics/mind/#its-concepts')
    await expect(page.getByRole('heading', { level: 2, name: 'Its Concepts' })).toBeInViewport()
  })
})

test.describe('Concept page v2: print', () => {
  test('prints the text alone, the References open, and the address after each external link', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    await expect(titleBlock(page).locator('img')).toBeVisible()
    await page.emulateMedia({ media: 'print' })
    await expect(titleBlock(page).locator('img')).toBeHidden()
    await expect(page.locator('header').first()).toBeHidden()
    await expect(page.locator('footer').last()).toBeHidden()
    await expect(contents(page)).toBeHidden()
    await expect(page.getByRole('button', { name: /^Copy verse/ }).first()).toBeHidden()
    await expect(titleBlock(page).getByText('Also written:')).toBeVisible()
    await expect(page.getByText('Show original').first()).toBeHidden()
    await expect(page.locator('#ref-bhavanani-2012')).toBeVisible()
    const doi = page.getByRole('link', { name: 'doi:10.3389/fpsyg.2025.1554014' })
    await expect(doi).toBeVisible()
    const after = await doi.evaluate((link) => getComputedStyle(link, '::after').content)
    expect(after).toContain('https://doi.org/10.3389/fpsyg.2025.1554014')
    const inks = linked(page).locator('li [aria-hidden="true"] > *')
    await expect(inks).toHaveCount(await vikshepaRowsWithRules())
    expect(
      await inks.evaluateAll((elements) =>
        elements.every((element) => getComputedStyle(element).clipPath === 'none'),
      ),
    ).toBe(true)
    await expect(page.locator('blockquote [lang="sa-Deva"]').first()).toBeVisible()
    // The comparison table prints its head row: sr-only on a phone screen, itself again on paper.
    const head = page
      .getByRole('region', { name: /Comparison between Indian and Western/ })
      .locator('thead')
    const headStyle = await head.evaluate((element) => {
      const style = getComputedStyle(element)
      return { position: style.position, clipPath: style.clipPath }
    })
    expect(headStyle.position, 'the printed head row is not taken out of flow').toBe('static')
    expect(headStyle.clipPath, 'the printed head row is not clipped away').toBe('none')
    await expect(head.locator('th').first()).toBeVisible()
  })
})

for (const { path } of ROUTES_IN_SCOPE.filter((r) => r.path.startsWith('/concepts/'))) {
  test(
    `${path} sets its title's IAST before its Devanagari, in DOM order`,
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, path)
      const order = await page.getByRole('heading', { level: 1 }).evaluate((h) => {
        const iast = h.querySelector('[lang="sa-Latn"], [lang="pi-Latn"]')
        const deva = h.querySelector('[lang="sa-Deva"]')
        if (!deva) return 'no-devanagari'
        return iast && iast.compareDocumentPosition(deva) & Node.DOCUMENT_POSITION_FOLLOWING
          ? 'iast-first'
          : 'wrong'
      })
      expect(order).not.toBe('wrong')
    },
  )
}
