import { expect, type Page, test } from '@playwright/test'

import { PAGES } from './routes'

/** A font as "family style weight", from an element's computed style or a font face. */
const font = (family: string, style: string, weight: string) =>
  `${family.split(',')[0]?.replace(/["']/g, '').trim()} ${style} ${weight}`

/** The fonts that set running text and headings on this page. */
function pageFonts(page: Page) {
  return page.evaluate(() => {
    const of = (element: Element | null) => {
      const style = getComputedStyle(element ?? document.body)
      return [style.fontFamily, style.fontStyle, style.fontWeight] as const
    }
    return { text: of(document.body), heading: of(document.querySelector('main h2')) }
  })
}

/** The font faces the page has loaded, as [family, style, weight]. */
function loadedFaces(page: Page) {
  return page.evaluate(() =>
    [...document.fonts]
      .filter((face) => face.status === 'loaded')
      .map((face) => [face.family, face.style, face.weight] as const),
  )
}

/** The font faces the page preloads, each read from the @font-face rule for its file. */
function preloadedFaces(page: Page) {
  return page.evaluate(() => {
    const faces = [...document.styleSheets].flatMap((sheet) =>
      [...sheet.cssRules]
        .filter((rule) => rule instanceof CSSFontFaceRule)
        .map((rule) => {
          const url = /url\(["']?([^"')]+)/.exec(rule.style.getPropertyValue('src'))?.[1] ?? ''
          return {
            path: new URL(url, sheet.href ?? location.href).pathname,
            family: rule.style.getPropertyValue('font-family'),
            style: rule.style.getPropertyValue('font-style') || 'normal',
            weight: rule.style.getPropertyValue('font-weight') || '400',
          }
        }),
    )
    return [...document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="font"]')].map(
      (link) => faces.find((face) => face.path === new URL(link.href).pathname),
    )
  })
}

for (const { path, name } of PAGES) {
  test.describe(name, () => {
    // Ticket 05: only the type that sets most of the page loads ahead of everything else.
    test('preloads only the font of its running text', async ({ page }) => {
      await page.goto(path)
      const { text } = await pageFonts(page)
      const preloaded = (await preloadedFaces(page)).map((face) =>
        face ? font(face.family, face.style, face.weight) : 'a file no font face uses',
      )
      expect(preloaded).toEqual([font(text[0], 'normal', '400')])
    })

    // Set in the running text's face at first, headings then get their own.
    test('sets its headings in their own face', async ({ page }) => {
      await page.goto(path)
      const { heading } = await pageFonts(page)
      await expect
        .poll(async () => (await loadedFaces(page)).map((face) => font(...face)))
        .toContain(font(...heading))
    })

    // Ticket 05: the first paint needs nothing more, so every other font is asked for after it.
    test('asks for no other font until its text is painted', async ({ page }) => {
      await page.goto(path)
      const { painted, early } = await page.evaluate(() => {
        const preloaded = new Set(
          [...document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="font"]')].map(
            (link) => link.href,
          ),
        )
        const painted = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0
        const early = performance
          .getEntriesByType('resource')
          .filter((font) => font.name.endsWith('.woff2') && font.startTime < painted)
          .filter((font) => !preloaded.has(font.name))
          .map((font) => new URL(font.name).pathname)
        return { painted, early }
      })
      expect(painted).toBeGreaterThan(0)
      expect(early).toEqual([])
    })

    // Not slanted or thickened regular: the italic and semibold have files of their own. They
    // arrive after the first paint, so they are waited for.
    test('sets italic and semibold text in its own italic and semibold faces', async ({ page }) => {
      await page.goto(path)
      const [family] = (await pageFonts(page)).text
      await expect
        .poll(async () => (await loadedFaces(page)).map((face) => font(...face)))
        .toEqual(
          expect.arrayContaining([font(family, 'italic', '400'), font(family, 'normal', '600')]),
        )
    })

    // Set in a system font at first, Devanagari then gets its own face too.
    test('sets its Devanagari in its own face', async ({ page }) => {
      await page.goto(path)
      const devanagari = page.locator('[lang="sa-Deva"]')
      test.skip((await devanagari.count()) === 0, 'no Devanagari on this page')
      const family = await devanagari
        .first()
        .evaluate((element) => getComputedStyle(element).fontFamily)
      await expect
        .poll(async () => (await loadedFaces(page)).map((face) => font(...face)))
        .toContain(font(family, 'normal', '400'))
    })
  })
}
