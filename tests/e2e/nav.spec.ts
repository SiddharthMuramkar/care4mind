import type { Locator, Page } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'

// The navigation shell (front-end-site ticket 04): the header's five sections, the panels a
// computer opens from two of them, the Drawer a phone opens from Menu, and the footer.

/** From 72rem (1152 px) the five sections fit on one line; below it the Menu takes over. */
const WIDE = 1152

const SECTIONS = [
  { name: 'Concepts', path: '/concepts/' },
  { name: 'Texts', path: '/texts/' },
  { name: 'Questionnaires', path: '/questionnaires/' },
  { name: 'Library', path: '/library/' },
  { name: 'Search', path: '/search/' },
] as const

const TOPICS = [
  { name: /^Self and person/, path: '/topics/self/', count: 4 },
  { name: /^Mind: states and obstacles/, path: '/topics/mind/', count: 5 },
  { name: /^Practice and progress/, path: '/topics/practice/', count: 4 },
  { name: /^Values: yama and niyama/, path: '/topics/values/', count: 4 },
  { name: /^Guṇa and temperament/, path: '/topics/temperament/', count: 2 },
] as const

// In the Library page's order, each with what it holds, counted as the Library page counts it.
const LIBRARY = [
  { name: /^References/, path: '/library/references/', holds: '188 References' },
  { name: /^Courses/, path: '/library/courses/', holds: '8 entries' },
  { name: /^Inspirational Books/, path: '/library/inspirational-books/', holds: '13 entries' },
  { name: /^Text Books/, path: '/library/textbooks/', holds: '20 entries' },
  { name: /^Methods/, path: '/library/methods/', holds: '5 sections' },
] as const

const isWide = (page: Page) => (page.viewportSize()?.width ?? 0) >= WIDE
const banner = (page: Page) => page.getByRole('banner')
const header = (page: Page) => banner(page).getByRole('navigation', { name: 'Main' })
const footerNav = (page: Page) =>
  page.getByRole('contentinfo').getByRole('navigation', { name: 'All sections' })

/** A link's address, as a path: every address ends with a slash (D02). */
const pathOf = async (link: Locator) =>
  new URL((await link.getAttribute('href')) ?? '', 'http://site').pathname
const atPath = (path: string) => new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)

/** Every animation still running on the page, after a reduced-motion rule has had its 1 ms. */
const moving = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => {
        if (animation.playState !== 'running') return false
        return Number(animation.effect?.getComputedTiming().duration) > 1
      })
      .map((animation) => (animation as CSSAnimation).animationName ?? 'a transition'),
  )

/**
 * Wait until what opened has finished arriving, so checks see it as it rests. A lotus's breath
 * never finishes, so animations without an end are left out.
 */
const settled = (page: Page) =>
  expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(
              (animation) =>
                animation.timeline instanceof DocumentTimeline &&
                animation.playState === 'running' &&
                Number.isFinite(animation.effect?.getComputedTiming().endTime ?? Infinity),
            ).length,
      ),
    )
    .toBe(0)

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the header shows the logo, then the five sections in order, or the Menu', async ({
    page,
  }) => {
    await page.goto('/concepts/vikshepa/')
    const links = banner(page).getByRole('link')
    if (isWide(page)) {
      await expect(links).toHaveText([
        'Care4Mind',
        ...SECTIONS.map(({ name }) => new RegExp(`^\\s*${name}\\s*$`)),
      ])
      for (const { name, path } of SECTIONS) {
        expect(await pathOf(header(page).getByRole('link', { name, exact: true }))).toBe(path)
      }
    } else {
      // On a phone the sections wait behind Menu, which is a link to the footer's navigation.
      await expect(links).toHaveText(['Care4Mind', /Search/, /Menu/])
      const menu = banner(page).getByRole('link', { name: 'Menu' })
      await expect(menu).toHaveAttribute('href', '#site-nav')
      expect(await pathOf(banner(page).getByRole('link', { name: 'Search' }))).toBe('/search/')
    }
    // Panels need JavaScript, so their toggles don't show without it.
    await expect(banner(page).getByRole('button')).toHaveCount(0)
  })

  test('every header link opens its page', async ({ page }) => {
    const names = isWide(page) ? SECTIONS : SECTIONS.filter(({ name }) => name === 'Search')
    for (const { name, path } of names) {
      await page.goto('/concepts/vikshepa/')
      await banner(page).getByRole('link', { name, exact: true }).click()
      await expect(page).toHaveURL(atPath(path))
    }
  })

  test('Menu leads to the full navigation in the footer', async ({ page }) => {
    test.skip(isWide(page), 'the sections show in the header at this width')
    await page.goto('/concepts/vikshepa/')
    await banner(page).getByRole('link', { name: 'Menu' }).click()
    await expect(page).toHaveURL(/#site-nav$/)
    await expect(footerNav(page)).toBeInViewport()
    // Not under the sticky header.
    const [nav, strip] = await Promise.all([
      footerNav(page).boundingBox(),
      banner(page).boundingBox(),
    ])
    expect(nav?.y).toBeGreaterThanOrEqual((strip?.y ?? 0) + (strip?.height ?? 0))
  })

  test('the footer carries the full navigation, the wordmark and the notices', async ({ page }) => {
    await page.goto('/')
    const nav = footerNav(page)
    for (const { name, path } of SECTIONS) {
      expect(await pathOf(nav.getByRole('link', { name, exact: true }))).toBe(path)
    }
    expect(await pathOf(nav.getByRole('link', { name: 'Concepts A–Z' }))).toBe('/concepts/')
    for (const { name, path } of [...TOPICS, ...LIBRARY]) {
      expect(await pathOf(nav.getByRole('link', { name }))).toBe(path)
    }
    // Both proposals are on outside production, so the map and the proposals page are listed.
    expect(await pathOf(nav.getByRole('link', { name: 'Concept map' }))).toBe('/concepts/map/')
    expect(await pathOf(nav.getByRole('link', { name: 'Proposals', exact: true }))).toBe(
      '/proposals/',
    )
    expect(await pathOf(nav.getByRole('link', { name: 'Proposal', exact: true }))).toBe(
      '/proposals/',
    )
    const footer = page.getByRole('contentinfo')
    await expect(footer.getByText('Care4Mind', { exact: true })).toBeVisible()
    await expect(footer).toContainText('Indic ways to invoke a perfect balanced mind')
    await expect(footer).toContainText('Powered by IIT Bombay-SJMSOM & HUA')
    await expect(footer).toContainText('A preview of the new site, not yet public.')
  })
})

test.describe('the section you are in', () => {
  // Where each page sits in the header: on a section's own page "page", below it "true".
  const CASES = [
    { path: '/', current: {} },
    { path: '/concepts/', current: { Concepts: 'page' } },
    { path: '/concepts/vikshepa/', current: { Concepts: 'true' } },
    { path: '/topics/mind/', current: { Concepts: 'true' } },
    { path: '/texts/yoga-sutra/', current: { Texts: 'true' } },
    { path: '/questionnaires/karmayoga-scale/', current: { Questionnaires: 'true' } },
    { path: '/library/', current: { Library: 'page' } },
    { path: '/library/references/', current: { Library: 'true' } },
    { path: '/search/', current: { Search: 'page' } },
    { path: '/proposals/', current: {} },
  ] as const

  test('is marked in the header, by aria-current and a lozenge under its name', async ({
    page,
  }) => {
    test.skip(!isWide(page), 'the sections show in the header from 72rem')
    for (const { path, current } of CASES) {
      await gotoReady(page, path)
      const marked = () =>
        header(page)
          .locator('a[aria-current]')
          .evaluateAll((links) =>
            Object.fromEntries(
              links.map((link) => [link.textContent?.trim(), link.getAttribute('aria-current')]),
            ),
          )
      await expect.poll(marked, { message: path }).toEqual(current)
      for (const name of Object.keys(current)) {
        const mark = await header(page)
          .getByRole('link', { name, exact: true })
          .evaluate((link) => {
            const marker = getComputedStyle(link, '::before')
            const after = getComputedStyle(link, '::after')
            return [marker, after].some(
              (style) => style.content !== 'none' && parseFloat(style.width) > 0,
            )
          })
        expect(mark, `${name} shows its mark on ${path}`).toBe(true)
      }
    }
  })

  test('is marked in the Drawer', async ({ page }) => {
    test.skip(isWide(page), 'the Drawer is for narrow screens')
    await gotoReady(page, '/concepts/vikshepa/')
    await banner(page).getByRole('button', { name: 'Menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Menu' })
    await expect(drawer.getByRole('link', { name: 'Concepts', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(drawer.getByRole('link', { name: 'Texts', exact: true })).not.toHaveAttribute(
      'aria-current',
    )
  })
})

test.describe('panels, on a computer', () => {
  test.beforeEach(({ page }) => {
    test.skip(!isWide(page), 'panels open from the header from 72rem')
  })

  const toggle = (page: Page, section: string) =>
    header(page).getByRole('button', { name: `More in ${section}` })
  const panel = (page: Page, section: string) =>
    page.getByRole('navigation', { name: section, exact: true })

  test('Concepts opens from the keyboard, lists the topics with their counts, the A–Z and the map, and Escape gives focus back', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    await header(page).getByRole('link', { name: 'Concepts', exact: true }).focus()
    await page.keyboard.press('Tab')
    await expect(toggle(page, 'Concepts')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(toggle(page, 'Concepts')).toHaveAttribute('aria-expanded', 'true')
    const concepts = panel(page, 'Concepts')
    for (const { name, path, count } of TOPICS) {
      const link = concepts.getByRole('link', { name })
      await expect(link).toContainText(`${count} Concepts`)
      expect(await pathOf(link)).toBe(path)
    }
    expect(await pathOf(concepts.getByRole('link', { name: 'Concepts A–Z' }))).toBe('/concepts/')
    expect(await pathOf(concepts.getByRole('link', { name: 'Concept map' }))).toBe('/concepts/map/')
    await expect(concepts.getByRole('link', { name: 'Proposal', exact: true })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(concepts).toBeHidden()
    await expect(toggle(page, 'Concepts')).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle(page, 'Concepts')).toBeFocused()
  })

  test('Library opens with ArrowDown, lists its five pages with what each holds, and Escape from inside gives focus back', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    await toggle(page, 'Library').focus()
    await page.keyboard.press('ArrowDown')
    const library = panel(page, 'Library')
    await expect(library.getByRole('link')).toHaveText([
      ...LIBRARY.map(({ name }) => name),
      /The whole Library/,
    ])
    for (const { name, path, holds } of LIBRARY) {
      const link = library.getByRole('link', { name })
      await expect(link).toContainText(holds)
      expect(await pathOf(link)).toBe(path)
    }
    await page.keyboard.press('Tab')
    await expect(library.getByRole('link', { name: LIBRARY[0].name })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(library).toBeHidden()
    await expect(toggle(page, 'Library')).toBeFocused()
  })

  test('Tab runs through an open panel and on to the next section: it never traps focus', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    await toggle(page, 'Concepts').focus()
    await page.keyboard.press('Enter')
    const concepts = panel(page, 'Concepts')
    await expect(concepts.getByRole('link', { name: 'Concepts A–Z' })).toBeVisible()
    const links = await concepts.getByRole('link').count()
    expect(links).toBeGreaterThanOrEqual(TOPICS.length + 2)
    for (let step = 0; step < links; step += 1) {
      await page.keyboard.press('Tab')
      await expect(concepts.locator(':focus')).toHaveCount(1)
    }
    await page.keyboard.press('Tab')
    await expect(header(page).getByRole('link', { name: 'Texts', exact: true })).toBeFocused()
    await expect(concepts).toBeHidden()
  })

  test('pointing opens a panel after a moment; it stays while the pointer moves into it, and goes when it leaves', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    await toggle(page, 'Concepts').hover()
    const concepts = panel(page, 'Concepts')
    await expect(concepts).toBeVisible()
    // Into the panel, across the gap below the header (WCAG 1.4.13, hoverable).
    const box = await concepts.getByRole('link', { name: TOPICS[2].name }).boundingBox()
    if (!box) throw new Error('the panel lists the topics')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 })
    await page.waitForTimeout(600)
    await expect(concepts).toBeVisible()
    await page.mouse.move(box.x + box.width / 2, 860, { steps: 12 })
    await expect(concepts).toBeHidden()
  })

  test('a panel link closes the panel and opens its page', async ({ page }) => {
    await gotoReady(page, '/')
    await toggle(page, 'Concepts').focus()
    await page.keyboard.press('Enter')
    await panel(page, 'Concepts').getByRole('link', { name: 'Concepts A–Z' }).click()
    await expect(page).toHaveURL(atPath('/concepts/'))
    await expect(panel(page, 'Concepts')).toBeHidden()
  })

  for (const section of ['Concepts', 'Library']) {
    test(`passes axe with the ${section} panel open`, async ({ page }) => {
      await gotoReady(page, '/concepts/vikshepa/')
      await toggle(page, section).focus()
      await page.keyboard.press('Enter')
      await expect(panel(page, section)).toBeVisible()
      await settled(page)
      await expectNoAxeViolations(page)
    })
  }

  test('with reduced motion, a panel opens and closes without sliding or fading', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoReady(page, '/')
    await toggle(page, 'Library').focus()
    await page.keyboard.press('Enter')
    await expect(panel(page, 'Library')).toBeVisible()
    expect(await moving(page)).toEqual([])
    await page.keyboard.press('Escape')
    await expect(panel(page, 'Library')).toBeHidden()
    expect(await moving(page)).toEqual([])
  })

  test('nothing in the header shifts as the panels arrive', async ({ page }) => {
    await page.addInitScript(() => {
      const shifts: number[] = []
      Object.defineProperty(window, '__shifts', { value: shifts })
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number })[]) {
          shifts.push(entry.value)
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await gotoReady(page, '/concepts/vikshepa/')
    // The panels arrive when the browser is idle, or as a pointer comes near.
    await header(page).hover()
    await toggle(page, 'Library').hover()
    await expect(panel(page, 'Library')).toBeVisible()
    const shifts = await page.evaluate(() => (window as unknown as { __shifts: number[] }).__shifts)
    expect(shifts.reduce((sum, shift) => sum + shift, 0)).toBeLessThan(0.001)
  })
})

test.describe('the Drawer, on a phone', () => {
  test.beforeEach(({ page }) => {
    test.skip(isWide(page), 'the Drawer is for narrow screens')
  })

  const menu = (page: Page) => banner(page).getByRole('button', { name: 'Menu' })
  // While the Drawer is open the page behind it, Menu included, is hidden from assistive
  // technology, so Menu's state is read from the element itself.
  const menuElement = (page: Page) => page.locator('header a[href="#site-nav"]')
  const drawer = (page: Page) => page.getByRole('dialog', { name: 'Menu' })
  /** Whether focus is on the Drawer or something in it. */
  const focusInDrawer = (page: Page) =>
    page.evaluate(() => document.activeElement?.closest('[role="dialog"]') != null)

  test('Menu opens it with the whole navigation; focus moves in and stays; Escape closes it and focus returns', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    await expect(menu(page)).toHaveAttribute('aria-expanded', 'false')
    await menu(page).click()
    await expect(drawer(page)).toBeVisible()
    await expect(menuElement(page)).toHaveAttribute('aria-expanded', 'true')
    const nav = drawer(page).getByRole('navigation', { name: 'Main' })
    for (const { name, path } of SECTIONS.filter(({ name }) => name !== 'Search')) {
      expect(await pathOf(nav.getByRole('link', { name, exact: true }))).toBe(path)
    }
    for (const { name, path } of [...TOPICS, ...LIBRARY]) {
      expect(await pathOf(nav.getByRole('link', { name }))).toBe(path)
    }
    for (const { name, holds } of LIBRARY) {
      await expect(nav.getByRole('link', { name })).toHaveAccessibleName(new RegExp(`${holds}$`))
    }
    expect(await pathOf(drawer(page).getByRole('link', { name: 'Search' }))).toBe('/search/')

    // Focus is inside, and Tab keeps it there, forwards and back.
    await expect.poll(() => focusInDrawer(page)).toBe(true)
    const stops = await drawer(page).locator('a[href], button').count()
    // At either end the trap's guards hand focus round to the other end within a moment.
    for (let step = 0; step < stops + 2; step += 1) {
      await page.keyboard.press('Tab')
      await expect.poll(() => focusInDrawer(page), `Tab ${step + 1} stays inside`).toBe(true)
    }
    for (let step = 0; step < 3; step += 1) {
      await page.keyboard.press('Shift+Tab')
      await expect.poll(() => focusInDrawer(page), `Shift+Tab ${step + 1} stays inside`).toBe(true)
    }

    await page.keyboard.press('Escape')
    await expect(drawer(page)).toBeHidden()
    await expect(menu(page)).toBeFocused()
    await expect(menu(page)).toHaveAttribute('aria-expanded', 'false')
  })

  test('Close puts it away and focus returns to Menu', async ({ page }) => {
    await gotoReady(page, '/')
    await menu(page).click()
    await drawer(page).getByRole('button', { name: 'Close' }).click()
    await expect(drawer(page)).toBeHidden()
    await expect(menu(page)).toBeFocused()
  })

  test('opens from the keyboard, with Enter or Space', async ({ page }) => {
    await gotoReady(page, '/')
    for (const key of ['Enter', ' ']) {
      await menu(page).focus()
      await page.keyboard.press(key)
      await expect(drawer(page)).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(drawer(page)).toBeHidden()
      await expect(menu(page)).toBeFocused()
    }
    // Space opened the Drawer instead of scrolling the page.
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('a swipe to the right puts it away', async ({ page }) => {
    await gotoReady(page, '/')
    await menu(page).click()
    // A swipe begins on the sheet as it rests, not while it is still sliding in.
    await settled(page)
    const title = drawer(page).getByText('Menu', { exact: true })
    const box = await title.boundingBox()
    if (!box) throw new Error('the Drawer has its title')
    // A finger swipes; a mouse dragged over the Drawer's text selects it instead.
    const y = box.y + box.height / 2
    const finger = (x: number) => [{ identifier: 1, clientX: x, clientY: y }]
    const start = finger(box.x + 4)
    await title.dispatchEvent('touchstart', {
      touches: start,
      targetTouches: start,
      changedTouches: start,
    })
    for (let step = 1; step <= 12; step += 1) {
      const at = finger(box.x + 4 + step * 25)
      await title.dispatchEvent('touchmove', { touches: at, targetTouches: at, changedTouches: at })
    }
    await title.dispatchEvent('touchend', {
      touches: [],
      targetTouches: [],
      changedTouches: finger(box.x + 304),
    })
    await expect(drawer(page)).toBeHidden()
  })

  test('a mouse dragged across its text selects the text and leaves the sheet where it was', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    await menu(page).click()
    await settled(page)
    const sheet = await drawer(page).boundingBox()
    const box = await drawer(page).getByText('Menu', { exact: true }).boundingBox()
    if (!sheet || !box) throw new Error('the Drawer has its title')
    await page.mouse.move(box.x + 1, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width - 1, box.y + box.height / 2, { steps: 12 })
    expect(await drawer(page).boundingBox()).toEqual(sheet)
    await page.mouse.up()
    expect(await page.evaluate(() => getSelection()?.toString())).toMatch(/Men/)
    await expect(drawer(page)).toBeVisible()
    expect(await drawer(page).boundingBox()).toEqual(sheet)
  })

  test('closes when the header widens, leaving the page scrollable and focus on something visible', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    await menu(page).click()
    await expect(drawer(page)).toBeVisible()
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(drawer(page)).toBeHidden()
    await expect
      .poll(() =>
        page.evaluate(() => {
          const focused = document.activeElement
          return (
            focused instanceof HTMLElement && focused !== document.body && focused.checkVisibility()
          )
        }),
      )
      .toBe(true)
    await page.mouse.move(640, 600)
    await page.mouse.wheel(0, 600)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  })

  test('following a link closes it and opens the page', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    await menu(page).click()
    await drawer(page).getByRole('link', { name: 'Texts', exact: true }).click()
    await expect(page).toHaveURL(atPath('/texts/'))
    await expect(drawer(page)).toBeHidden()
  })

  test('passes axe with the Drawer open', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    await menu(page).click()
    await expect(drawer(page)).toBeVisible()
    await settled(page)
    await expectNoAxeViolations(page)
  })

  test('with reduced motion, it opens and closes without sliding or fading', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoReady(page, '/')
    await menu(page).click()
    await expect(drawer(page)).toBeVisible()
    expect(await moving(page)).toEqual([])
    await page.keyboard.press('Escape')
    await expect(drawer(page)).toBeHidden()
    expect(await moving(page)).toEqual([])
  })
})

test('with reduced motion, a section link changes the page at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await gotoReady(page, '/concepts/vikshepa/')
  // In the header from 72rem; on narrower screens, in the Drawer.
  if (!isWide(page)) await banner(page).getByRole('button', { name: 'Menu' }).click()
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Texts', exact: true })
    .click()
  await expect(page).toHaveURL(atPath('/texts/'))
  expect(await moving(page)).toEqual([])
})

test('the Drawer, the panels and the toasts are not in any page’s first load', async ({
  page,
  request,
}) => {
  // Each part's own words, which survive minifying: a CSS variable Base UI sets on it.
  const MARKERS = {
    Drawer: '--drawer-swipe-movement-x',
    'navigation panels': 'data-base-ui-navigation-menu-trigger',
    toasts: '--toast-swipe-movement-x',
  }
  for (const path of ['/', '/concepts/vikshepa/', '/questionnaires/karmayoga-scale/']) {
    const html = await (await request.get(path)).text()
    const scripts = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map(([, src]) => src ?? '')
    expect(scripts.length).toBeGreaterThan(0)
    for (const src of scripts) {
      const code = await (await request.get(src)).text()
      for (const [part, marker] of Object.entries(MARKERS)) {
        expect(code.includes(marker), `${part} in ${src}, loaded with ${path}`).toBe(false)
      }
    }
  }
  // The page still works: the Drawer or the panels arrive on intent.
  await gotoReady(page, '/')
  if (isWide(page)) {
    await header(page).getByRole('button', { name: 'More in Library' }).hover()
    await expect(page.getByRole('navigation', { name: 'Library', exact: true })).toBeVisible()
  } else {
    await banner(page).getByRole('button', { name: 'Menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()
  }
})

test('the header fits on one line at 320, 360, 768 and 1440 px, every control a full target', async ({
  page,
}) => {
  for (const width of [320, 360, 768, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    await gotoReady(page, '/concepts/vikshepa/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, `no sideways scroll at ${width} px`).toBeLessThanOrEqual(0)
    const strip = await banner(page).boundingBox()
    expect(strip?.height, `one line at ${width} px`).toBeLessThanOrEqual(72)
    const logo = banner(page).getByRole('link', { name: 'Care4Mind home', exact: true })
    expect((await logo.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48)
    const controls = banner(page).locator('a:visible, button:visible')
    for (const control of await controls.all()) {
      const box = await control.boundingBox()
      const name = await control.evaluate(
        (element) => element.textContent?.trim() || element.outerHTML.slice(0, 60),
      )
      expect(box?.width ?? 0, `${name} is wide enough at ${width} px`).toBeGreaterThanOrEqual(44)
      expect(box?.height ?? 0, `${name} is tall enough at ${width} px`).toBeGreaterThanOrEqual(44)
      expect(box?.x ?? -1, `${name} is on screen at ${width} px`).toBeGreaterThanOrEqual(0)
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width)
    }
  }
})
