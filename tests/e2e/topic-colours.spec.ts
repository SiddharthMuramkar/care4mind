import type { Locator, Page } from '@playwright/test'

import { concepts } from '@/content'

import { expect, gotoReady, test } from './fixtures'

// A topic's colour carries a reader through it: a rule under a topic's or a Concept's title, the
// marker of the section being read, and the A–Z's chip for the topic. Always beside the topic's
// name in words (WCAG 1.4.1), and never as the colour of text.

const vikshepa = await concepts.get('vikshepa')
if (!vikshepa) throw new Error('Vikṣepa is in the content.')

/** A colour token as the browser paints it, read off a probe so it compares with a computed colour. */
const painted = (page: Page, token: string) =>
  page.evaluate((token) => {
    const probe = document.createElement('i')
    probe.style.backgroundColor = `var(${token})`
    document.body.append(probe)
    const colour = getComputedStyle(probe).backgroundColor
    probe.remove()
    return colour
  }, token)

/** The parts of the title page painted in `colour`, as boxes, with the title's foot to measure them by. */
async function rulesUnderTitle(header: Locator, colour: string) {
  return header.evaluate((header, colour) => {
    const title = header.querySelector('h1')?.getBoundingClientRect()
    const rules = [...header.querySelectorAll('*')]
      .filter((part) => getComputedStyle(part).backgroundColor === colour)
      .map((part) => part.getBoundingClientRect())
      .map(({ top, height, width }) => ({ top, height, width }))
    return { titleFoot: title?.bottom ?? Infinity, rules }
  }, colour)
}

test.describe('a rule in the topic’s colour under the title', { tag: '@one-width' }, () => {
  for (const { path, topic } of [
    { path: '/topics/mind/', topic: 'mind' },
    { path: '/concepts/vikshepa/', topic: vikshepa.topic.slug },
  ]) {
    test(`on ${path}`, async ({ page }) => {
      await gotoReady(page, path)
      const header = page.getByRole('main').getByRole('article').first().locator('header').first()
      const { titleFoot, rules } = await rulesUnderTitle(
        header,
        await painted(page, `--color-topic-${topic}`),
      )
      expect(rules, 'one rule in the topic’s colour').toHaveLength(1)
      const [rule] = rules
      expect(rule?.height).toBe(4)
      expect(rule?.top).toBeGreaterThanOrEqual(titleFoot)
    })
  }
})

test(
  'a Concept page’s contents mark the section being read in its topic’s colour',
  {
    tag: '@from-1440',
  },
  async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const line = page.getByRole('navigation', { name: 'Contents' }).getByRole('link').first()
    const marker = await line.evaluate((link) => getComputedStyle(link, '::before').backgroundColor)
    expect(marker).toBe(await painted(page, `--color-topic-${vikshepa.topic.slug}`))
  },
)

test('the A–Z’s chip for a topic carries its colour', { tag: '@one-width' }, async ({ page }) => {
  await gotoReady(page, '/concepts/')
  const chip = page
    .getByRole('group', { name: 'Topic', exact: true })
    .getByRole('button', { name: /^Mind/ })
  await expect(chip).toBeVisible()
  const shadow = await chip.evaluate((button) => getComputedStyle(button).boxShadow)
  expect(shadow).toContain(await painted(page, '--color-topic-mind'))
})
