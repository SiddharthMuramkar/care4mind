import type { Locator, Page } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'
import { hrefFor } from '@/content'

import { ROUTES } from './routes'

// The navigation shell: the header's sections and Search, the panels
// a computer opens from two of them, the Drawer a phone opens from Menu, and the footer.

/** From 48rem (768 px) the header lists the sections beside Search; below it the Menu takes over. */
const TABLET = 768

/** From 64rem (1024 px) Concepts and Library open panels, and Search is a labelled field. */
const WIDE = 1024

/** A take page is a route only while its Questionnaire can be taken in this build. */
const TAKEABLE = ROUTES.some(({ kind }) => kind === 'questionnaire-flow')

const SECTIONS = [
  { name: 'Concepts', path: '/concepts/' },
  { name: 'Traditional texts', path: '/texts/' },
  { name: 'Library', path: '/library/' },
  { name: 'Questionnaires', path: '/questionnaires/' },
  { name: 'Search', path: '/search/' },
] as const

const TOPICS = [
  { name: /^Self and person/, path: '/topics/self/', count: 4 },
  { name: /^Mind: states and obstacles/, path: '/topics/mind/', count: 5 },
  { name: /^Practice and progress/, path: '/topics/practice/', count: 4 },
  { name: /^Values: yama and niyama/, path: '/topics/values/', count: 4 },
  { name: /^Temperament \(guṇa\)/, path: '/topics/temperament/', count: 2 },
] as const

// In the Library page's order, each with what it holds, counted as the Library page counts it.
const LIBRARY = [
  { name: /^References/, path: '/library/references/', holds: '188 References' },
  { name: /^Courses in India/, path: '/library/courses/', holds: '8 entries' },
  { name: /^Inspirational books/, path: '/library/inspirational-books/', holds: '13 entries' },
  { name: /^Textbooks/, path: '/library/textbooks/', holds: '20 entries' },
  { name: /^Therapy approaches/, path: '/library/methods/', holds: '5 sections' },
] as const

/**
 * Start here follows the wordmark, while its proposal's route exists, where the strip has room:
 * from 30rem (480 px) until the sections join at 48rem, and again from 80rem (1280 px).
 */
const START_LINK = ROUTES.some(({ path }) => path === hrefFor({ page: 'start' }))
  ? ['Start here']
  : []
const startShows = (width: number) => (width >= 480 && width < TABLET) || width >= 1280

/** Log in sits beside Search, at every width, while the login switch is on. */
const LOG_IN_LINK = ROUTES.some(({ path }) => path === hrefFor({ page: 'log-in' }))
  ? [/^\s*Log in\s*$/]
  : []

const isWide = (page: Page) => (page.viewportSize()?.width ?? 0) >= WIDE
const fromTablet = (page: Page) => (page.viewportSize()?.width ?? 0) >= TABLET
const banner = (page: Page) => page.getByRole('banner')
const header = (page: Page) => banner(page).getByRole('navigation', { name: 'Main' })
const footerNav = (page: Page) =>
  page.getByRole('contentinfo').getByRole('navigation', { name: 'All sections' })

/** On a phone the footer folds its long lists: open each, as a reader would, script or none. */
async function unfoldFooter(page: Page) {
  for (const toggle of await footerNav(page).locator('summary:visible').all()) await toggle.click()
}

/** A link's address, as a path: every address ends with a slash. */
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
 * Wait until what opened has finished arriving, so checks see it as it rests. Only the hero's
 * breath ends on its own, so animations without an end are left out, and the poll outlasts it.
 */
const settled = (page: Page) =>
  expect
    .poll(
      () =>
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
      { timeout: 10_000 },
    )
    .toBe(0)

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the header shows the logo, then the sections and Search in order, or the Menu', async ({
    page,
  }) => {
    await page.goto('/concepts/vikshepa/')
    const links = banner(page).getByRole('link')
    const start = startShows(page.viewportSize()?.width ?? 0) ? START_LINK : []
    if (fromTablet(page)) {
      await expect(links).toHaveText([
        'Care4Mind',
        ...start,
        ...SECTIONS.map(({ name }) => new RegExp(`^\\s*${name}\\s*$`)),
        ...LOG_IN_LINK,
      ])
      for (const { name, path } of SECTIONS) {
        expect(await pathOf(header(page).getByRole('link', { name, exact: true }))).toBe(path)
      }
    } else {
      // On a phone the sections wait behind Menu, which is a link to the footer's navigation.
      await expect(links).toHaveText(['Care4Mind', ...start, /Search/, ...LOG_IN_LINK, /Menu/])
      const menu = banner(page).getByRole('link', { name: 'Menu' })
      await expect(menu).toHaveAttribute('href', '#site-nav')
      expect(await pathOf(banner(page).getByRole('link', { name: 'Search' }))).toBe('/search/')
    }
    // The header always lists Questionnaires, whether or not one can be taken yet.
    await expect(header(page).locator('a[href$="/questionnaires/"]')).toHaveCount(1)
    // Panels need JavaScript, so their toggles don't show without it.
    await expect(banner(page).getByRole('button')).toHaveCount(0)
  })

  test('the header names Search in words only once there is room', async ({ page }) => {
    await page.goto('/concepts/vikshepa/')
    const label = banner(page).getByRole('link', { name: 'Search' }).getByText('Search')
    const box = await label.boundingBox()
    // sr-only leaves a 1px box; the wide header undoes it from a later cascade layer.
    if ((page.viewportSize()?.width ?? 0) >= WIDE) expect(box?.width).toBeGreaterThan(1)
    else expect(box?.width ?? 0).toBeLessThanOrEqual(1)
  })

  test('every header link opens its page', async ({ page }) => {
    const names = fromTablet(page) ? SECTIONS : SECTIONS.filter(({ name }) => name === 'Search')
    for (const { name, path } of names) {
      await page.goto('/concepts/vikshepa/')
      await banner(page).getByRole('link', { name, exact: true }).click()
      await expect(page).toHaveURL(atPath(path))
    }
  })

  test('each navigation label is the heading of the page it opens', async ({ page }) => {
    await page.goto('/')
    // The footer holds every page the header, its panels and the phone menu open.
    await unfoldFooter(page)
    const links = await footerNav(page).getByRole('link').all()
    const targets: { label: string; path: string }[] = []
    for (const link of links) {
      const label = (await link.innerText()).trim()
      // The proposal note is a marker beside a link, not a navigation label.
      if (label === 'Proposal') continue
      targets.push({ label, path: await pathOf(link) })
    }
    expect(targets.length).toBeGreaterThanOrEqual(SECTIONS.length + TOPICS.length + LIBRARY.length)
    for (const { label, path } of targets) {
      await page.goto(path)
      // While none can be taken, the footer's Questionnaires link says so beside its name.
      const heading =
        label === 'Self-reflection questionnaires (in preparation)' ? 'Questionnaires' : label
      await expect(page.getByRole('heading', { level: 1 }), path).toHaveText(heading)
    }
    // The one label that names part of a page: the Concepts page's A–Z list.
    await page.goto('/concepts/')
    await expect(page.getByRole('heading', { level: 2, name: 'From A to Z' })).toBeVisible()
  })

  test(
    'Menu leads to the full navigation in the footer',
    { tag: '@only-360' },
    async ({ page }) => {
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
    },
  )

  test('the footer carries the full navigation, the wordmark and the notices', async ({ page }) => {
    await page.goto('/')
    await unfoldFooter(page)
    const nav = footerNav(page)
    // Questionnaires keeps the footer's own label while none can be taken, so it is checked below.
    for (const { name, path } of SECTIONS.filter(({ name }) => name !== 'Questionnaires')) {
      expect(await pathOf(nav.getByRole('link', { name, exact: true }))).toBe(path)
    }
    // The footer always keeps its Questionnaires link, saying so while none can be taken.
    expect(
      await pathOf(
        nav.getByRole('link', {
          name: TAKEABLE ? 'Questionnaires' : 'Self-reflection questionnaires (in preparation)',
          exact: true,
        }),
      ),
    ).toBe('/questionnaires/')
    // "All concepts A–Z" would repeat "Concepts", so the footer leaves it out.
    await expect(nav.getByRole('link', { name: 'All concepts A–Z' })).toHaveCount(0)
    await expect(nav.getByRole('link', { name: 'About' })).toHaveCount(0)
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
    await expect(footer).toContainText('Indian ideas for a balanced mind, explained simply.')
    await expect(footer).toContainText('Powered by IIT Bombay-SJMSOM & HUA')
    await expect(footer).toContainText('A preview of the new site, not yet public.')
  })

  test(
    'every page listed in the footer is a full target on a phone',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 })
      await page.goto('/concepts/vikshepa/')
      await unfoldFooter(page)
      const links = await footerNav(page).locator('ul ul > li > a').all()
      expect(links.length).toBeGreaterThan(0)
      for (const link of links) {
        const box = await link.boundingBox()
        expect(box?.height ?? 0, await link.innerText()).toBeGreaterThanOrEqual(44)
      }
    },
  )

  test('the footer heads its three columns Concepts, Library and More', async ({ page }) => {
    await page.goto('/')
    const headings = footerNav(page).getByRole('heading', { level: 2 })
    await expect(headings).toHaveText(['Concepts', 'Library', 'More'])
    // A section with a page of its own is a link to it; More has none.
    for (const name of ['Concepts', 'Library']) {
      await expect(headings.filter({ hasText: name }).getByRole('link')).toHaveCount(1)
    }
    await expect(headings.filter({ hasText: 'More' }).getByRole('link')).toHaveCount(0)
  })

  test(
    'on a phone the footer folds its two long lists, each opening without JavaScript, and keeps the help line open',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 })
      await page.goto('/concepts/vikshepa/')
      const nav = footerNav(page)
      for (const { name } of [...TOPICS, ...LIBRARY]) {
        await expect(nav.getByRole('link', { name })).toBeHidden()
      }
      // The short list, More, stands open, and so does the help line under the columns.
      await expect(nav.getByRole('link', { name: 'Picture credits', exact: true })).toBeVisible()
      await expect(page.locator('footer [data-help-line]')).toBeVisible()
      const toggles = nav.locator('summary')
      await expect(toggles).toHaveText(['More in Concepts', 'More in Library'])
      await expect(toggles.first()).toHaveAccessibleName('More in Concepts')
      for (const toggle of await toggles.all()) {
        const box = await toggle.boundingBox()
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
      }
      await toggles.first().click()
      for (const { name } of TOPICS) await expect(nav.getByRole('link', { name })).toBeVisible()
      await expect(nav.getByRole('link', { name: LIBRARY[0].name })).toBeHidden()
      await toggles.last().click()
      for (const { name } of LIBRARY) await expect(nav.getByRole('link', { name })).toBeVisible()
    },
  )

  test(
    'from 48rem the footer’s lists stand open, with nothing to open them',
    { tag: '@from-768' },
    async ({ page }) => {
      await page.goto('/concepts/vikshepa/')
      const nav = footerNav(page)
      for (const { name } of [...TOPICS, ...LIBRARY]) {
        await expect(nav.getByRole('link', { name })).toBeVisible()
      }
      await expect(nav.locator('summary')).toHaveCount(2)
      await expect(nav.locator('summary:visible')).toHaveCount(0)
    },
  )

  test(
    'a link in the footer’s lists shows a line under it only on hover and focus',
    { tag: '@one-width' },
    async ({ page }) => {
      await page.goto('/')
      const link = footerNav(page).getByRole('link', { name: 'Picture credits', exact: true })
      await expect(link).toHaveCSS('text-decoration-line', 'none')
      await link.hover()
      await expect(link).toHaveCSS('text-decoration-line', 'underline')
      await page.mouse.move(0, 0)
      await expect(link).toHaveCSS('text-decoration-line', 'none')
      // Focused from the keyboard, as its focus ring shows.
      await page.keyboard.press('Tab')
      await link.focus()
      expect(await link.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
      await expect(link).toHaveCSS('text-decoration-line', 'underline')
    },
  )

  test('the footer is signed with the Emblem beside the wordmark and the motto under it', async ({
    page,
  }) => {
    await page.goto('/concepts/vikshepa/')
    const footer = page.getByRole('contentinfo')
    const emblem = footer.locator('img')
    await expect(emblem).toHaveCount(1)
    await emblem.scrollIntoViewIfNeeded()
    await expect(emblem).toHaveAttribute('alt', '')
    await expect(emblem).toHaveAttribute('width', '72')
    await expect(emblem).toHaveAttribute('src', /emblem-ring/)
    await expect(emblem).not.toHaveAttribute('sizes')
    const candidates = (await emblem.getAttribute('srcset'))?.split(', ') ?? []
    expect(candidates).toHaveLength(2)
    expect(candidates[0]).toMatch(/[?&]w=72&.* 1x$/)
    expect(candidates[1]).toMatch(/[?&]w=144&.* 2x$/)
    await expect
      .poll(() => emblem.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0)

    const motto = footer.locator('[lang="sa-Deva"]')
    await expect(motto).toHaveText('यद् भावं तद् भवति')
    const [ring, wordmark, line] = await Promise.all([
      emblem.boundingBox(),
      footer.getByText('Care4Mind', { exact: true }).boundingBox(),
      motto.boundingBox(),
    ])
    expect(ring).toMatchObject({ width: 72, height: 72 })
    expect((ring?.x ?? 0) + 72, 'the wordmark stands beside the Emblem').toBeLessThanOrEqual(
      wordmark?.x ?? 0,
    )
    expect((ring?.y ?? 0) + 72, 'the motto stands under the Emblem').toBeLessThanOrEqual(
      line?.y ?? 0,
    )
  })

  test(
    'the footer Emblem keeps its box when the browser text size is raised on a phone',
    { tag: '@self-width' },
    async ({ browser, baseURL }) => {
      // Only a launch flag sets the browser's own default text size.
      const raised = await browser
        .browserType()
        .launch({ args: ['--blink-settings=defaultFontSize=32'] })
      try {
        const page = await raised.newPage({ baseURL, viewport: { width: 360, height: 800 } })
        await page.goto('/search/')
        expect(await page.getByRole('contentinfo').locator('img').boundingBox()).toMatchObject({
          width: 72,
          height: 72,
        })
      } finally {
        await raised.close()
      }
    },
  )
})

test.describe('the section you are in', () => {
  // Where each page sits in the header: on a section's own page "page", below it "true".
  const CASES = [
    { path: '/', current: {} },
    { path: '/concepts/', current: { Concepts: 'page' } },
    { path: '/concepts/vikshepa/', current: { Concepts: 'true' } },
    { path: '/topics/mind/', current: { Concepts: 'true' } },
    { path: '/texts/yoga-sutra/', current: { 'Traditional texts': 'true' } },
    {
      path: '/questionnaires/karmayoga-scale/',
      current: { Questionnaires: 'true' },
    },
    { path: '/library/', current: { Library: 'page' } },
    { path: '/library/references/', current: { Library: 'true' } },
    { path: '/search/', current: { Search: 'page' } },
    { path: '/proposals/', current: {} },
  ] as const

  test(
    'is marked in the header, by aria-current and a lozenge under its name',
    { tag: '@from-768' },
    async ({ page }) => {
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
    },
  )

  test('is marked in the Drawer', { tag: '@only-360' }, async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    await banner(page).getByRole('button', { name: 'Menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Menu' })
    await expect(drawer.getByRole('link', { name: 'Concepts', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(
      drawer.getByRole('link', { name: 'Traditional texts', exact: true }),
    ).not.toHaveAttribute('aria-current')
  })
})

test.describe('panels, on a computer', { tag: '@from-1440' }, () => {
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
    expect(await pathOf(concepts.getByRole('link', { name: 'All concepts A–Z' }))).toBe(
      '/concepts/',
    )
    expect(await pathOf(concepts.getByRole('link', { name: 'Concept map' }))).toBe('/concepts/map/')
    // The five topics come first, then "All concepts A–Z" and the map.
    const inOrder = await concepts.getByRole('link').all()
    expect(
      await Promise.all(inOrder.slice(0, TOPICS.length + 2).map((link) => pathOf(link))),
    ).toEqual([...TOPICS.map(({ path }) => path), '/concepts/', '/concepts/map/'])
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
    await expect(concepts.getByRole('link', { name: 'All concepts A–Z' })).toBeVisible()
    const links = await concepts.getByRole('link').count()
    expect(links).toBeGreaterThanOrEqual(TOPICS.length + 2)
    for (let step = 0; step < links; step += 1) {
      await page.keyboard.press('Tab')
      await expect(concepts.locator(':focus')).toHaveCount(1)
    }
    await page.keyboard.press('Tab')
    await expect(
      header(page).getByRole('link', { name: 'Traditional texts', exact: true }),
    ).toBeFocused()
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

  for (const width of [WIDE, 1360, 1440]) {
    test(`at ${width} px one click switches panels, by click or by hover then click, and the pointer sits under its toggle`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await gotoReady(page, '/')
      await page.reload()
      await expect(toggle(page, 'Library')).toHaveAttribute('data-ready')
      const arrow = page.locator('[class*="arrow"][data-side]')
      const opened = async (section: string, other: string) => {
        await expect(panel(page, section)).toBeVisible()
        await expect(panel(page, other)).toBeHidden()
        await expect(toggle(page, section)).toHaveAttribute('aria-expanded', 'true')
        await expect(toggle(page, other)).toHaveAttribute('aria-expanded', 'false')
        const item = await toggle(page, section).locator('xpath=ancestor::li[1]').boundingBox()
        if (!item) throw new Error('a toggle stands in its item')
        await expect(async () => {
          const box = await arrow.boundingBox()
          if (!box) throw new Error('the open panel has its pointer')
          const middle = box.x + box.width / 2
          expect(middle).toBeGreaterThanOrEqual(item.x)
          expect(middle).toBeLessThanOrEqual(item.x + item.width)
        }).toPass()
      }
      for (const hoverFirst of [false, true]) {
        for (let round = 0; round < 5; round += 1) {
          for (const [section, other] of [
            ['Concepts', 'Library'],
            ['Library', 'Concepts'],
          ] as const) {
            if (hoverFirst) {
              await toggle(page, section).hover()
              await expect(toggle(page, section)).toHaveAttribute('aria-expanded', 'true')
            }
            await toggle(page, section).click()
            await opened(section, other)
          }
        }
        await page.keyboard.press('Escape')
        await expect(panel(page, 'Library')).toBeHidden()
      }
    })
  }

  test('Enter and Space on the other toggle switch panels in one press, and focus stays on the pressed toggle', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    await expect(toggle(page, 'Library')).toHaveAttribute('data-ready')
    await toggle(page, 'Concepts').focus()
    await page.keyboard.press('Enter')
    await expect(panel(page, 'Concepts')).toBeVisible()
    for (const [section, other, key] of [
      ['Library', 'Concepts', 'Space'],
      ['Concepts', 'Library', 'Enter'],
    ] as const) {
      await toggle(page, section).focus()
      await page.keyboard.press(key)
      await expect(toggle(page, section)).toBeFocused()
      await expect(panel(page, section)).toBeVisible()
      await expect(panel(page, other)).toBeHidden()
      await expect(toggle(page, section)).toHaveAttribute('aria-expanded', 'true')
      await expect(toggle(page, other)).toHaveAttribute('aria-expanded', 'false')
    }
    await page.keyboard.press('Escape')
    await expect(panel(page, 'Concepts')).toBeHidden()
    await expect(toggle(page, 'Concepts')).toBeFocused()
  })

  test('Enter on a toggle just after hover switched panels opens that toggle’s panel', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    await expect(toggle(page, 'Library')).toHaveAttribute('data-ready')
    await toggle(page, 'Library').hover()
    await expect(panel(page, 'Library')).toBeVisible()
    await toggle(page, 'Concepts').focus()
    await page.keyboard.press('Enter')
    await expect(panel(page, 'Concepts')).toBeVisible()
    await expect(panel(page, 'Library')).toBeHidden()
  })

  test('a click well after hover opened a panel closes it', async ({ page }) => {
    await gotoReady(page, '/')
    await expect(toggle(page, 'Concepts')).toHaveAttribute('data-ready')
    await toggle(page, 'Concepts').hover()
    await expect(panel(page, 'Concepts')).toBeVisible()
    // Past the window in which a press finishes the hover's gesture.
    await page.waitForTimeout(800)
    await toggle(page, 'Concepts').click()
    await expect(panel(page, 'Concepts')).toBeHidden()
  })

  test('a panel link closes the panel and opens its page', async ({ page }) => {
    await gotoReady(page, '/')
    await toggle(page, 'Concepts').focus()
    await page.keyboard.press('Enter')
    await panel(page, 'Concepts').getByRole('link', { name: 'All concepts A–Z' }).click()
    await expect(page).toHaveURL(atPath('/concepts/'))
    await expect(panel(page, 'Concepts')).toBeHidden()
  })

  for (const section of ['Concepts', 'Library']) {
    test(`a click outside the open ${section} panel closes it, and the page stays where it is`, async ({
      page,
    }) => {
      await gotoReady(page, '/concepts/vikshepa/')
      await expect(toggle(page, section)).toHaveAttribute('data-ready')
      await toggle(page, section).click()
      const open = panel(page, section)
      await expect(open).toBeVisible()
      await settled(page)
      // The page's lower left corner: the margin beside the text, clear of the panel and of any link.
      const box = await open.boundingBox()
      const height = page.viewportSize()?.height ?? 0
      if (!box) throw new Error(`the ${section} panel is on the page`)
      const spot = { x: 8, y: height - 8 }
      expect(spot.x < box.x || spot.y > box.y + box.height, 'the spot is outside the panel').toBe(
        true,
      )
      await page.mouse.click(spot.x, spot.y)
      await expect(open).toBeHidden()
      await expect(toggle(page, section)).toHaveAttribute('aria-expanded', 'false')
      await expect(page).toHaveURL(atPath('/concepts/vikshepa/'))
    })
  }

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
    // Shifts as the page's fonts arrive are not the panels' doing; count from a settled page.
    await page.evaluate(async () => {
      await document.fonts.ready
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      )
      ;(window as unknown as { __shifts: number[] }).__shifts.length = 0
    })
    // The panels arrive when the browser is idle, or as a pointer comes near.
    await header(page).hover()
    await toggle(page, 'Library').hover()
    await expect(panel(page, 'Library')).toBeVisible()
    const shifts = await page.evaluate(() => (window as unknown as { __shifts: number[] }).__shifts)
    expect(shifts.reduce((sum, shift) => sum + shift, 0)).toBeLessThan(0.001)
  })
})

test.describe('every panel stays inside the screen', { tag: '@self-width' }, () => {
  const toggle = (page: Page, section: string) =>
    header(page).getByRole('button', { name: `More in ${section}` })
  const panel = (page: Page, section: string) =>
    page.getByRole('navigation', { name: section, exact: true })
  const arrow = (page: Page) => page.locator('[class*="arrow"][data-side]')

  /** The open panel keeps its collision padding from each edge, its pointer under its item. */
  const inside = async (page: Page, section: string) => {
    const width = page.viewportSize()?.width ?? 0
    await expect(async () => {
      const box = await panel(page, section).boundingBox()
      if (!box) throw new Error(`the ${section} panel is on the page`)
      expect(box.x, `the ${section} panel keeps off the left edge`).toBeGreaterThanOrEqual(16)
      expect(
        box.x + box.width,
        `the ${section} panel keeps off the right edge`,
      ).toBeLessThanOrEqual(width - 16)
      const item = await toggle(page, section).locator('xpath=ancestor::li[1]').boundingBox()
      const pointer = await arrow(page).boundingBox()
      if (!item || !pointer) throw new Error('the open panel points at its item')
      const middle = pointer.x + pointer.width / 2
      expect(middle, `the ${section} pointer sits under its item`).toBeGreaterThanOrEqual(item.x)
      expect(middle, `the ${section} pointer sits under its item`).toBeLessThanOrEqual(
        item.x + item.width,
      )
    }).toPass()
  }

  for (const width of [320, 390, WIDE, 1280]) {
    test(`at ${width} px no open panel overflows either edge, and a panel's pointer sits under its toggle`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await gotoReady(page, '/')
      if (width < TABLET) {
        // On a phone the sections open in the Drawer, the only panel there is.
        await banner(page).getByRole('button', { name: 'Menu' }).click()
        const drawer = page.getByRole('dialog', { name: 'Menu' })
        await expect(drawer).toBeVisible()
        await settled(page)
        const box = await drawer.boundingBox()
        if (!box) throw new Error('the Drawer is on the page')
        expect(box.x, 'the Drawer stays off the left edge').toBeGreaterThanOrEqual(0)
        expect(box.x + box.width, 'the Drawer stays off the right edge').toBeLessThanOrEqual(width)
        return
      }
      await expect(toggle(page, 'Library')).toHaveAttribute('data-ready')
      for (const section of ['Concepts', 'Library']) {
        await toggle(page, section).click()
        await expect(panel(page, section)).toBeVisible()
        await settled(page)
        await inside(page, section)
        await page.keyboard.press('Escape')
        await expect(panel(page, section)).toBeHidden()
      }
    })
  }

  test('a panel open while the window narrows stays inside, its pointer under its toggle', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await gotoReady(page, '/')
    await expect(toggle(page, 'Library')).toHaveAttribute('data-ready')
    await toggle(page, 'Library').click()
    await expect(panel(page, 'Library')).toBeVisible()
    await settled(page)
    await page.setViewportSize({ width: WIDE, height: 900 })
    await expect(panel(page, 'Library')).toBeVisible()
    await settled(page)
    await inside(page, 'Library')
  })
})

test.describe('the Drawer, on a phone', { tag: '@only-360' }, () => {
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
    // The menu opens with Home, then Search, before the sections.
    const links = drawer(page).getByRole('link')
    await expect(links.first()).toHaveText('Home')
    expect(await pathOf(links.first())).toBe('/')
    expect(await pathOf(links.nth(1))).toBe('/search/')
    // The phone menu always lists Questionnaires, like the header.
    await expect(drawer(page).locator('a[href$="/questionnaires/"]')).toHaveCount(1)
    // Under Concepts the five topics come first, then "All concepts A–Z" and the map.
    const conceptsList = nav.locator('ul', { hasText: 'All concepts A–Z' })
    const listed = await conceptsList.getByRole('link').all()
    expect(
      await Promise.all(listed.slice(0, TOPICS.length + 2).map((link) => pathOf(link))),
    ).toEqual([...TOPICS.map(({ path }) => path), '/concepts/', '/concepts/map/'])

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

  test('lists every page the footer does, Home first and the help line last, so any page is two presses away', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    const paths = (links: Locator) =>
      links.evaluateAll((all) =>
        all.map((link) => new URL(link.getAttribute('href') ?? '', 'http://site').pathname),
      )
    const footer = await paths(footerNav(page).locator('a[href]'))
    expect(footer.length).toBeGreaterThan(0)
    await menu(page).click()
    await expect(drawer(page)).toBeVisible()
    const listed = await paths(drawer(page).locator('a[href]'))
    for (const path of footer) expect(listed, `the Drawer lists ${path}`).toContain(path)

    const home = drawer(page).getByRole('link').first()
    await expect(home).toHaveText('Home')
    expect(await pathOf(home)).toBe('/')
    await expect(home).toHaveAttribute('aria-current', 'page')
    const nav = drawer(page).getByRole('navigation', { name: 'Main' })
    // Questionnaires keeps its place in the contents, the fourth section, whether or not one can be taken.
    await expect(nav.locator('ol > li').nth(3)).toContainText('Questionnaires')
    expect(await pathOf(nav.getByRole('link', { name: 'Questionnaires', exact: true }))).toBe(
      '/questionnaires/',
    )
    expect(await pathOf(nav.getByRole('link', { name: 'Picture credits', exact: true }))).toBe(
      '/credits/',
    )
    // The help line is the sheet's last line, each number ready to dial.
    const help = drawer(page).locator('[data-help-line]')
    await expect(help).toHaveCount(1)
    for (const tel of ['tel:14416', 'tel:18008914416', 'tel:112']) {
      await expect(help.locator(`a[href="${tel}"]`)).toHaveCount(1)
    }
    expect(
      await drawer(page).evaluate((sheet) => {
        const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT)
        let last: Node | null = null
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (node.textContent?.trim()) last = node
        }
        return last?.parentElement?.closest('[data-help-line]') != null
      }),
    ).toBe(true)
  })

  test('closes when the page changes, by Back too', async ({ page }) => {
    await gotoReady(page, '/')
    await banner(page).getByRole('link', { name: 'Search' }).click()
    await expect(page).toHaveURL(atPath('/search/'))
    await menu(page).click()
    await expect(drawer(page)).toBeVisible()
    await page.goBack()
    await expect.poll(() => new URL(page.url()).pathname).toBe('/')
    await expect(drawer(page)).toBeHidden()
    await expect(menuElement(page)).toHaveAttribute('aria-expanded', 'false')
  })

  test('hides the page behind it from assistive technology while open, and gives it back as it closes', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const behind = ['banner', 'main', 'contentinfo'] as const
    for (const role of behind) await expect(page.getByRole(role)).toHaveCount(1)
    await menu(page).click()
    await expect(drawer(page)).toBeVisible()
    await expect(drawer(page)).toHaveAttribute('aria-modal', 'true')
    for (const role of behind) {
      await expect(page.getByRole(role), `the ${role} is hidden behind the Drawer`).toHaveCount(0)
    }
    await page.keyboard.press('Escape')
    await expect(drawer(page)).toBeHidden()
    for (const role of behind) await expect(page.getByRole(role)).toHaveCount(1)
  })

  test('a press on Menu as soon as the page arrives, on a slowed CPU, opens the Drawer or reaches the footer’s navigation', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'slowing the CPU needs the Chrome DevTools Protocol')
    // Once at full speed, so each visit after comes from the cache, as a reload does.
    await gotoReady(page, '/')
    const devtools = await page.context().newCDPSession(page)
    await devtools.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    // By its id: an open Drawer hides the footer from the accessibility tree.
    const footerInView = () =>
      page.locator('#site-nav').evaluate((nav) => {
        const box = nav.getBoundingClientRect()
        return box.top < window.innerHeight && box.bottom > 0
      })
    for (let visit = 1; visit <= 3; visit += 1) {
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await menuElement(page).click()
      await expect(async () => {
        if (await drawer(page).isVisible()) return
        expect(
          new URL(page.url()).hash,
          `visit ${visit}: no Drawer, so the link's own target`,
        ).toBe('#site-nav')
        expect(await footerInView(), `visit ${visit}: the footer's navigation in view`).toBe(true)
      }).toPass({ timeout: 15_000 })
    }
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
    // The text itself is selectable, so the swipe starts on the strip beside the sheet.
    await settled(page)
    const sheet = await drawer(page).boundingBox()
    if (!sheet) throw new Error('the Drawer has its sheet')
    const y = sheet.y + 24
    await page.mouse.move(Math.max(2, sheet.x - 12), y)
    await page.mouse.down()
    await page.mouse.move(sheet.x + sheet.width * 0.7, y, { steps: 12 })
    await page.mouse.up()
    await expect(drawer(page)).toBeHidden()
  })

  test(
    'a page opened wide, then narrowed, has the Drawer ready for its first press',
    { tag: '@self-width' },
    async ({ page }) => {
      // A phone loaded in landscape and turned upright: the Menu arrives with no pointer near it.
      await page.setViewportSize({ width: 900, height: 800 })
      await gotoReady(page, '/')
      await page.setViewportSize({ width: 360, height: 800 })
      await expect(menu(page)).toHaveAttribute('role', 'button')
      await menu(page).click()
      await expect(drawer(page)).toBeVisible()
      expect(new URL(page.url()).hash).toBe('')
    },
  )

  test(
    'widening the header closes it, leaves the page scrollable, and puts focus on a visible element',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 })
      await gotoReady(page, '/')
      await menu(page).click()
      await expect(drawer(page)).toBeVisible()
      // Just to the width where the sections join the header.
      await page.setViewportSize({ width: TABLET, height: 900 })
      await expect(drawer(page)).toBeHidden()
      await expect
        .poll(() =>
          page.evaluate(() => {
            const current = document.activeElement
            return (
              current instanceof HTMLElement &&
              current !== document.body &&
              current.checkVisibility()
            )
          }),
        )
        .toBe(true)
      expect(
        await page.evaluate(() => {
          // Smooth scrolling would report the old position in this same turn.
          const before = window.scrollY
          window.scrollTo({ top: before + 400, behavior: 'instant' })
          const moved = window.scrollY > before
          window.scrollTo({ top: before, behavior: 'instant' })
          return moved
        }),
      ).toBe(true)
    },
  )

  test('dragging across the Menu text selects it and leaves the sheet where it was', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    await menu(page).click()
    await settled(page)
    const sheet = drawer(page)
    const title = sheet.getByText('Menu', { exact: true })
    const before = await sheet.boundingBox()
    const box = await title.boundingBox()
    if (!before || !box) throw new Error('the Drawer has its title')
    await page.mouse.move(box.x + 1, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width - 1, box.y + box.height / 2, { steps: 10 })
    await page.mouse.up()
    expect((await page.evaluate(() => getSelection()?.toString() ?? '')).toLowerCase()).toContain(
      'menu',
    )
    const after = await sheet.boundingBox()
    expect(after?.x).toBeCloseTo(before.x, 0)
    expect(after?.y).toBeCloseTo(before.y, 0)
    await expect(sheet).toBeVisible()
  })

  test('following a link closes it and opens the page', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    await menu(page).click()
    await drawer(page).getByRole('link', { name: 'Traditional texts', exact: true }).click()
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
  // In the header from 48rem; on a phone, in the Drawer.
  if (!fromTablet(page)) await banner(page).getByRole('button', { name: 'Menu' }).click()
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Traditional texts', exact: true })
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
  // The page still works: the Drawer or the panels arrive on intent, and between the two the
  // sections are links that need neither.
  await gotoReady(page, '/')
  if (isWide(page)) {
    await header(page).getByRole('button', { name: 'More in Library' }).hover()
    await expect(page.getByRole('navigation', { name: 'Library', exact: true })).toBeVisible()
  } else if (fromTablet(page)) {
    await header(page).getByRole('link', { name: 'Library', exact: true }).click()
    await expect(page).toHaveURL(atPath('/library/'))
  } else {
    await banner(page).getByRole('button', { name: 'Menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()
  }
})

test(
  'the header fits on one line at 320, 360, 768, 1024, 1118 and 1440 px, every control a full target',
  { tag: '@self-width' },
  async ({ page }) => {
    for (const width of [320, 360, 768, 1024, 1118, 1440]) {
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
      // From 48rem the sections stand in the header, nothing to open first.
      if (width >= TABLET) {
        for (const { name } of SECTIONS) {
          await expect(header(page).getByRole('link', { name, exact: true })).toBeVisible()
        }
      }
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
        // In the one row: nothing wraps under the strip.
        expect(box?.y ?? -1, `${name} is in the strip at ${width} px`).toBeGreaterThanOrEqual(
          strip?.y ?? 0,
        )
        expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(
          (strip?.y ?? 0) + (strip?.height ?? 0),
        )
      }
    }
  },
)

test(
  'the sections stand evenly spaced, a panel’s chevron counted with its label',
  { tag: '@from-768' },
  async ({ page }) => {
    await gotoReady(page, '/')
    if (isWide(page)) {
      await expect(header(page).getByRole('button', { name: 'More in Library' })).toHaveAttribute(
        'data-ready',
      )
    }
    const gaps = await header(page)
      .locator('ul')
      .first()
      .evaluate((list) => {
        const spans = [...list.children].map((item) => {
          const label = item.querySelector('a')?.getBoundingClientRect()
          if (!label) throw new Error('each section is a link')
          // A chevron that shows ends its section; a hidden one takes no room.
          const chevron = item.querySelector('button svg')
          const end = chevron?.getClientRects().length
            ? chevron.getBoundingClientRect().right
            : label.right
          return { start: label.left, end }
        })
        return spans.slice(1).map((span, index) => span.start - (spans[index]?.end ?? 0))
      })
    expect(gaps).toHaveLength(3)
    expect(Math.max(...gaps) - Math.min(...gaps), `gaps ${gaps.join(', ')}`).toBeLessThanOrEqual(1)
  },
)
