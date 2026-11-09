import type { Page } from '@playwright/test'

import { expect } from './fixtures'

const PATH = '/concepts/vikshepa/'

/** Where each error page takes over: inside the page, or at the root layout it sits in. */
export type ErrorPageKind = 'segment' | 'global'

/** Text unique to the inline data row whose failure brings up each page. */
const MARKER: Record<ErrorPageKind, string> = {
  segment: '"id":"main"',
  // The footer's navigation, which the root layout renders above the root error boundary.
  global: '"id":"site-nav"',
}

const INLINE_DATA = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g

/** The document with the first row holding `marker` turned into an error, and whether one was. */
function breakRow(html: string, marker: string) {
  let broken = false
  const body = html.replace(INLINE_DATA, (whole, data: string) => {
    if (broken) return whole
    const rows = (JSON.parse(`"${data}"`) as string).split('\n').map((row) => {
      const id = broken || !row.includes(marker) ? null : /^([0-9a-f]+):\[/.exec(row)?.[1]
      if (!id) return row
      broken = true
      return `${id}:E{"digest":"made-for-the-test"}`
    })
    return broken ? `self.__next_f.push([1,${JSON.stringify(rows.join('\n'))}])` : whole
  })
  return { body, broken }
}

/**
 * Open an error page on the built site. No route throws on purpose, because one would ship, so
 * this breaks one row of a page's inline data and lets hydration fail there. It fails loudly if
 * the row isn't found, so a Next upgrade can't leave a test looking at the wrong page. It can't
 * use `gotoReady`: the root layout's hydration marker goes with the global error page.
 */
export async function gotoErrorPage(page: Page, kind: ErrorPageKind) {
  await page.route(`**${PATH}`, async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue()
    const response = await route.fetch()
    const { body, broken } = breakRow(await response.text(), MARKER[kind])
    if (!broken) throw new Error(`No inline data row holds ${MARKER[kind]}.`)
    await route.fulfill({ response, body })
  })
  await page.goto(PATH)
  await expect(page.getByRole('heading', { name: 'This page couldn’t be set' })).toBeVisible()
}
