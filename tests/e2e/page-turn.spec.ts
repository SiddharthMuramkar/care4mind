import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import {
  expectPageTurned,
  pageTurns,
  prefetched,
  recordPageTurns,
  releasePageTurn,
} from './page-turns'

test('following a Concept card turns the page forward to the Concept page', async ({ page }) => {
  await recordPageTurns(page)
  await page.goto('/')
  const card = page.getByRole('link', { name: 'Read about Vikṣepa' })
  await prefetched(card)
  await card.click()
  await expect(page).toHaveURL('/concepts/vikshepa')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vikṣepa')
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
  await page.goto('/')
  const card = page.getByRole('link', { name: 'Read about Vikṣepa' })
  await prefetched(card)
  const from = await page.getByRole('heading', { name: 'Vikṣepa', level: 3 }).boundingBox()
  await card.click()
  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toHaveText('Vikṣepa')
  const [turn] = await pageTurns(page)
  const to = await heading.boundingBox()
  const flight = turn?.flights.find(({ name }) => name.includes('vikshepa'))
  const [start = NaN, midway = NaN, end = NaN] = flight?.y ?? []
  expect(Math.abs(start - (from?.y ?? NaN)), 'it sets off from the card').toBeLessThan(2)
  expect(Math.abs(end - (to?.y ?? NaN)), 'it lands on the heading').toBeLessThan(2)
  expect(midway, 'it flies between them').not.toBe(start)
  expect((midway - start) * (end - midway), 'it flies between them').toBeGreaterThan(0)
})

test('the header stays put while the page turns', async ({ page }) => {
  await recordPageTurns(page, { hold: true })
  await page.goto('/')
  const card = page.getByRole('link', { name: 'Read about Vikṣepa' })
  await prefetched(card)
  await card.click()
  await pageTurns(page)
  // Half-way through the turn: the header looks exactly as it does once the page is still.
  const header = page.getByRole('banner')
  const box = (await header.boundingBox()) ?? undefined
  const midTurn = await page.screenshot({ clip: box })
  await releasePageTurn(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vikṣepa')
  await expect(header).toBeVisible()
  expect(await page.screenshot({ clip: box })).toEqual(midTurn)
})

test('links in the header change page at once, without turning it', async ({ page }) => {
  await recordPageTurns(page)
  await page.goto('/concepts/vikshepa')
  const link = page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Questionnaires', exact: true })
  await prefetched(link)
  await link.click()
  await expect(page.getByRole('heading', { name: 'Questionnaires', level: 2 })).toBeInViewport()
  for (const change of await pageTurns(page)) {
    expect(change.leaving).toBeNull()
    expect(change.arriving).toBeNull()
  }
})

test("the browser's back button changes page at once, without turning it", async ({ page }) => {
  await recordPageTurns(page)
  await page.goto('/')
  const card = page.getByRole('link', { name: 'Read about Vikṣepa' })
  await prefetched(card)
  await card.click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vikṣepa')
  await page.goBack()
  await expect(page).toHaveURL('/')
  await expect(card).toBeVisible()
  const [, back] = await pageTurns(page)
  expect(back?.leaving ?? null).toBeNull()
  expect(back?.arriving ?? null).toBeNull()
})

test('the "Home" breadcrumb turns the page back to the homepage', async ({ page }) => {
  await recordPageTurns(page)
  await page.goto('/concepts/vikshepa')
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

test('the "Questionnaires" breadcrumb turns back to the homepage\'s Questionnaires', async ({
  page,
}) => {
  await recordPageTurns(page)
  await page.goto('/questionnaires/karmayoga-scale')
  const crumb = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', {
    name: 'Questionnaires',
  })
  await prefetched(crumb)
  await crumb.click()
  await expect(page).toHaveURL('/#questionnaires')
  await expect(page.getByRole('heading', { name: 'Questionnaires', level: 2 })).toBeInViewport()
  expectPageTurned((await pageTurns(page))[0], 'back')
})

test('related links turn the page forward, from a Concept to its Questionnaire and back to the Concept', async ({
  page,
}) => {
  await recordPageTurns(page)
  await page.goto('/concepts/vikshepa')
  const questionnaire = page.getByRole('link', { name: 'KarmaYoga Scale' })
  await prefetched(questionnaire)
  await questionnaire.click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarmaYoga Scale')

  const concept = page.getByRole('link', { name: /^Vikṣepa/ })
  await prefetched(concept)
  await concept.click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vikṣepa')

  const [there, back] = await pageTurns(page)
  expectPageTurned(there, 'forward')
  expectPageTurned(back, 'forward')
})
