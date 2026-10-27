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
    test('preloads only the fonts of its running text and headings', async ({ page }) => {
      await page.goto(path)
      const { text, heading } = await pageFonts(page)
      const preloaded = (await preloadedFaces(page)).map((face) =>
        face ? font(face.family, face.style, face.weight) : 'a file no font face uses',
      )
      expect(preloaded.sort()).toEqual([font(text[0], 'normal', '400'), font(...heading)].sort())
    })

    // Not slanted or thickened regular: the italic and semibold have files of their own.
    test('sets italic and semibold text in its own italic and semibold faces', async ({ page }) => {
      await page.goto(path)
      const [family] = (await pageFonts(page)).text
      await page.evaluate(() => document.fonts.ready)
      const loaded = await page.evaluate(() =>
        [...document.fonts]
          .filter((face) => face.status === 'loaded')
          .map((face) => [face.family, face.style, face.weight] as const),
      )
      expect(loaded.map((face) => font(...face))).toEqual(
        expect.arrayContaining([font(family, 'italic', '400'), font(family, 'normal', '600')]),
      )
    })
  })
}
