import type { Page } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'
import { logoLotus, moving } from './lotuses'
import {
  expectPageTurned,
  pageTurns,
  prefetched,
  recordPageTurns,
  releasePageTurn,
} from './page-turns'

test('following a Concept card turns the page forward to the Concept page', async ({ page }) => {
  await recordPageTurns(page)
  await gotoReady(page, '/')
  const card = page.getByRole('link', { name: 'Read about Vikṣepa' })
  await prefetched(card)
  await card.click()
  await expect(page).toHaveURL('/concepts/vikshepa/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Vikṣepa')
  const turns = await pageTurns(page)
  expect(turns).toHaveLength(1)
  expectPageTurned(turns[0], 'forward')
  await expect(page).toHaveTitle(/Vikṣepa/)
  await expectNoAxeViolations(page)
})

test("a Concept card's title flies into the Concept page's heading as the page turns", async ({
  page,
}) => {
  await recordPageTurns(page)
  await gotoReady(page, '/')
  const card = page.getByRole('link', { name: 'Read about Vikṣepa' })
  await prefetched(card)
  const from = await page.getByRole('heading', { name: 'Vikṣepa', level: 3 }).boundingBox()
  await card.click()
  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toContainText('Vikṣepa')
  const [turn] = await pageTurns(page)
  const to = await heading.boundingBox()
  const flight = turn?.flights.find(({ name }) => name.includes('vikshepa'))
  const [x0 = NaN, xMid = NaN, x1 = NaN] = flight?.x ?? []
  const [y0 = NaN, yMid = NaN, y1 = NaN] = flight?.y ?? []
  const off = (x: number, y: number, box: typeof from) =>
    Math.hypot(x - (box?.x ?? NaN), y - (box?.y ?? NaN))
  expect(off(x0, y0, from), 'it sets off from the card').toBeLessThan(2)
  expect(off(x1, y1, to), 'it lands on the heading').toBeLessThan(2)
  // Half-way it is part of the way along the line from the card to the heading,
  // whichever way that line runs: where the two sit level, it flies sideways only.
  const along =
    ((xMid - x0) * (x1 - x0) + (yMid - y0) * (y1 - y0)) / ((x1 - x0) ** 2 + (y1 - y0) ** 2)
  expect(along, 'it flies between them').toBeGreaterThan(0)
  expect(along, 'it flies between them').toBeLessThan(1)
})

test('the header stays put while the page turns, its lotus breathing on', async ({ page }) => {
  await recordPageTurns(page, { hold: true })
  await gotoReady(page, '/')
  const card = page.getByRole('link', { name: 'Read about Vikṣepa' })
  await prefetched(card)
  await card.click()
  // The page turns once the next page is ready: wait until it has started, held half-way.
  // (pageTurns alone would return at once, before anything has been recorded.)
  await expect.poll(async () => (await pageTurns(page)).length).toBe(1)

  // Half-way through the turn the lotus breathes on in the header's layer.
  expect(await moving(logoLotus(page)), 'the lotus breathes through the turn').toBe(true)

  // The header beside the lotus looks exactly as it does once the page is still.
  const header = page.getByRole('banner')
  const clips = await headerBesideTheLotus(page)
  const shoot = () => Promise.all(clips.map((clip) => page.screenshot({ clip })))
  const midTurn = await shoot()
  await releasePageTurn(page)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Vikṣepa')
  await expect(header).toBeVisible()
  expect(await shoot()).toEqual(midTurn)
})

/**
 * The header either side of its lotus, as screenshot clips. The lotus breathes, and a page turn's
 * layer covers a screenshot's mask.
 */
async function headerBesideTheLotus(page: Page) {
  const header = await page.getByRole('banner').boundingBox()
  const lotus = await logoLotus(page).boundingBox()
  if (!header || !lotus) throw new Error('the header and its lotus must be on screen')
  const afterLotus = lotus.x + lotus.width
  return [
    { ...header, width: lotus.x - header.x },
    { ...header, x: afterLotus, width: header.x + header.width - afterLotus },
  ]
}

test('links in the header change page at once, without turning it', async ({ page }) => {
  await recordPageTurns(page)
  await gotoReady(page, '/concepts/vikshepa/')
  // The sections are in the header from 72rem; on narrower screens, in the Menu's Drawer.
  if ((page.viewportSize()?.width ?? 0) < 1152) {
    await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click()
  }
  const link = page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Questionnaires', exact: true })
  // An untyped link has no turn to lose, so it needn't wait for its page to be prefetched.
  await link.click()
  await expect(page).toHaveURL(/\/questionnaires\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  for (const change of await pageTurns(page)) {
    expect(change.leaving).toBeNull()
    expect(change.arriving).toBeNull()
  }
})

test("the browser's back button changes page at once, without turning it", async ({ page }) => {
  await recordPageTurns(page)
  await gotoReady(page, '/')
  const card = page.getByRole('link', { name: 'Read about Vikṣepa' })
  await prefetched(card)
  await card.click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Vikṣepa')
  await page.goBack()
  await expect(page).toHaveURL('/')
  await expect(card).toBeVisible()
  const [, back] = await pageTurns(page)
  expect(back?.leaving ?? null).toBeNull()
  expect(back?.arriving ?? null).toBeNull()
})

test('the "Home" breadcrumb turns the page back to the homepage', async ({ page }) => {
  await recordPageTurns(page)
  await gotoReady(page, '/concepts/vikshepa/')
  const home = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', {
    name: 'Home',
  })
  await prefetched(home)
  await home.click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
  const turns = await pageTurns(page)
  expect(turns).toHaveLength(1)
  expectPageTurned(turns[0], 'back')
  await expect(page).toHaveTitle(/Indian psychology/)
  await expectNoAxeViolations(page)
})

// Since front-end-site ticket 03 the trail comes from the site map (D15): Questionnaires is a page.
test('the "Questionnaires" breadcrumb turns back to the Questionnaires page', async ({ page }) => {
  await recordPageTurns(page)
  await gotoReady(page, '/questionnaires/karmayoga-scale/')
  const crumb = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', {
    name: 'Questionnaires',
  })
  await prefetched(crumb)
  await crumb.click()
  await expect(page).toHaveURL('/questionnaires/')
  await expect(page.getByRole('heading', { name: 'Questionnaires', level: 1 })).toBeInViewport()
  expectPageTurned((await pageTurns(page))[0], 'back')
})

test('related links turn the page forward, from a Concept to its Questionnaire and back to the Concept', async ({
  page,
}) => {
  await recordPageTurns(page)
  await gotoReady(page, '/concepts/vikshepa/')
  const questionnaire = page.getByRole('link', { name: 'KarmaYoga Scale' })
  await prefetched(questionnaire)
  await questionnaire.click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarmaYoga Scale')

  const concept = page.getByRole('link', { name: /^Vikṣepa/ })
  await prefetched(concept)
  await concept.click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Vikṣepa')

  const [there, back] = await pageTurns(page)
  expectPageTurned(there, 'forward')
  expectPageTurned(back, 'forward')
})
