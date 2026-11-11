import type { Locator, Page } from '@playwright/test'

import { expect, gotoReady, test } from './fixtures'
import { at, ROUTES_IN_SCOPE } from './routes'

/** No text on the site is set smaller than this, in CSS px. */
const SMALLEST = 15

/**
 * The type a reader sees on this page: its visible h1, h2 and h3 headings in reading order, and
 * every visible run of text set below `smallest`. Text hidden for screen readers only, or not
 * drawn at all, is left out; text in a drawing counts at the size the drawing is shown.
 */
function typeOnPage(page: Page, smallest: number) {
  return page.evaluate((smallest) => {
    const shown = (element: Element) =>
      !element.closest('.sr-only') &&
      element.getClientRects().length > 0 &&
      element.checkVisibility({ visibilityProperty: true })
    // A drawing scales its text with it, so its labels are measured as drawn.
    const scale = (element: Element) => {
      const drawing = element instanceof SVGElement ? element.closest('svg') : null
      return drawing?.getScreenCTM()?.a ?? 1
    }
    const size = (element: Element) =>
      Math.round(parseFloat(getComputedStyle(element).fontSize) * scale(element) * 100) / 100
    const words = (element: Element) =>
      (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 50)

    const headings = [...document.querySelectorAll('h1, h2, h3')].filter(shown).map((heading) => ({
      level: Number(heading.localName.slice(1)),
      text: words(heading),
      size: size(heading),
    }))

    const small: string[] = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement
      if (!parent || !node.textContent?.trim()) continue
      if (parent.closest('script, style, noscript, template, title')) continue
      if (!shown(parent)) continue
      const px = size(parent)
      if (px < smallest) small.push(`${px} px: <${parent.localName}> “${words(parent)}”`)
    }
    return { headings, small: [...new Set(small)] }
  }, smallest)
}

// Headings step down in size, so a reader sees a page's structure at a glance: the h1 above every
// h2 and h3, and each h3 below the h2 whose section it is in. Nothing is set too small to read
// comfortably. Every route, at each width.
for (const route of ROUTES_IN_SCOPE) {
  test(`${route.path} sets its h1 above its h2s, each h2 above its h3s, and no text under ${SMALLEST} px`, async ({
    page,
  }) => {
    const where = at(page, route.path)
    await gotoReady(page, route.path)
    const { headings, small } = await typeOnPage(page, SMALLEST)
    const titles = headings.filter((heading) => heading.level === 1)
    expect.soft(titles, `${where}: one h1 on screen`).toHaveLength(1)
    const title = titles[0] ?? { text: 'missing', size: 0 }
    let section: (typeof headings)[number] | undefined
    for (const heading of headings) {
      if (heading.level === 1) continue
      expect
        .soft(
          heading.size,
          `${where}: the h1 “${title.text}” above the h${heading.level} “${heading.text}”`,
        )
        .toBeLessThan(title.size)
      if (heading.level === 2) section = heading
      else if (section) {
        expect
          .soft(heading.size, `${where}: the h2 “${section.text}” above its h3 “${heading.text}”`)
          .toBeLessThan(section.size)
      }
    }
    expect.soft(small, `${where}: text under ${SMALLEST} px`).toEqual([])
  })
}

/** How the browser breaks an element's lines: wrap, balance or pretty. */
const wrapping = (element: Locator) =>
  element.evaluate((node) => getComputedStyle(node).textWrapStyle)

// Paragraphs avoid a lone last word, and titles break into lines of even length.
test.describe('line breaking', { tag: '@one-width' }, () => {
  test('a Concept’s paragraphs avoid a lone word, its title and section titles balance', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const main = page.getByRole('main')
    expect(await wrapping(main.getByRole('heading', { level: 1 }))).toBe('balance')
    const sections = await main.getByRole('heading', { level: 2 }).all()
    expect(sections.length).toBeGreaterThan(0)
    for (const heading of sections) expect.soft(await wrapping(heading)).toBe('balance')
    const paragraph = main.locator('section p').first()
    await expect(paragraph).toBeVisible()
    expect(await wrapping(paragraph)).toBe('pretty')
  })

  test('the homepage’s title and section titles balance', async ({ page }) => {
    await gotoReady(page, '/')
    const main = page.getByRole('main')
    expect(await wrapping(main.getByRole('heading', { level: 1 }))).toBe('balance')
    for (const heading of await main.getByRole('heading', { level: 2 }).all()) {
      expect.soft(await wrapping(heading)).toBe('balance')
    }
  })
})
