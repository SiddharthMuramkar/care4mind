import { resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'

import type { Page } from '@playwright/test'

import { expect, gotoReady, test } from './fixtures'

// `pnpm shots`, the parts that need a browser: putting an element in a state, and waiting for
// pictures. The rest is in tests/unit/shots.test.ts.

type State = 'hover' | 'focus-visible' | 'active'

const shots = (await import(pathToFileURL(resolve('scripts/shots.mjs')).href)) as {
  enterState(page: Page, shot: { path: string; selector: string; state: State }): Promise<void>
  picturesDone(page: Page, path: string): Promise<void>
}

const STAND_IN = '/shots-stand-in/'
/** The smallest PNG: one transparent pixel. */
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

/** Open a page of this body, served by the test, so it can hold what the site doesn't yet. */
async function openStandIn(page: Page, body: string) {
  await page.route(`**${STAND_IN}`, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><title>Stand-in</title>${body}`,
    }),
  )
  await page.goto(STAND_IN)
}

const STATES: readonly State[] = ['hover', 'focus-visible', 'active']

test.describe('pnpm shots', { tag: '@one-width' }, () => {
  for (const state of STATES) {
    test(`puts the first visible match in its ${state} state`, async ({ page }) => {
      await openStandIn(
        page,
        `<a href="#a" hidden>Hidden</a><a href="#b" id="first">First</a> <a href="#c">Later</a>`,
      )
      await shots.enterState(page, { path: STAND_IN, selector: 'a', state })
      const entered = await page
        .locator('#first')
        .evaluate((link, pseudo) => link.matches(pseudo), `:${state}`)
      expect(entered).toBe(true)
    })
  }

  test('centres the element on the screen, clear of a sticky header', async ({ page }) => {
    await openStandIn(
      page,
      `<header style="position:fixed;inset:0 0 auto;height:80px;background:#fff">Header</header>
       <div style="height:5000px"></div>
       <a id="far" href="#far" style="display:block;height:20px">Far down</a>
       <div style="height:5000px"></div>`,
    )
    // On the screen but under the header, where nothing but the centring moves it clear.
    await page.evaluate(() => window.scrollTo(0, 4980))

    await shots.enterState(page, { path: STAND_IN, selector: '#far', state: 'hover' })

    const { top, middle, screen } = await page.locator('#far').evaluate((link) => {
      const box = link.getBoundingClientRect()
      return { top: box.top, middle: box.top + box.height / 2, screen: window.innerHeight }
    })
    expect(top).toBeGreaterThan(80)
    expect(Math.abs(middle - screen / 2)).toBeLessThan(2)
  })

  test('stops at a selector nothing visible matches', async ({ page }) => {
    await gotoReady(page, '/')
    await expect(
      shots.enterState(page, { path: '/', selector: '#no-such-element', state: 'hover' }),
    ).rejects.toThrow('No visible element on / matches “#no-such-element”.')
  })

  test('stops at a state the element can’t reach', async ({ page }) => {
    await gotoReady(page, '/')
    await expect(
      shots.enterState(page, { path: '/', selector: 'body', state: 'focus-visible' }),
    ).rejects.toThrow('“body” on / never became :focus-visible.')
  })

  test('stops soon, in its own words, at an element it can’t hover', async ({ page }) => {
    await openStandIn(
      page,
      '<a href="#x" style="position:absolute;left:-9999px">Off the screen</a>',
    )
    const started = Date.now()
    await expect(
      shots.enterState(page, { path: STAND_IN, selector: 'a', state: 'hover' }),
    ).rejects.toThrow(`“a” on ${STAND_IN} couldn’t be hovered`)
    expect(Date.now() - started).toBeLessThan(10_000)
  })

  test('waits for a slow lazy picture far below the screen', async ({ page }) => {
    const asked: string[] = []
    await page.route(`**${STAND_IN}far.png`, async (route) => {
      asked.push(route.request().url())
      await delay(1_500)
      await route.fulfill({ contentType: 'image/png', body: PIXEL })
    })
    await openStandIn(
      page,
      `<div style="height:9000px"></div>
       <img id="far" alt="" width="10" height="10" loading="lazy" src="${STAND_IN}far.png">`,
    )
    await page.waitForLoadState('load')
    expect(asked, 'a lazy picture this far down waits to be asked for').toEqual([])

    await shots.picturesDone(page, STAND_IN)

    const shown = await page
      .locator('#far')
      .evaluate((picture: HTMLImageElement) => picture.complete && picture.naturalWidth > 0)
    expect(shown).toBe(true)
  })
})
