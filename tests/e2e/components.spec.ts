import type { Locator } from '@playwright/test'

import { expect, gotoReady, test } from './fixtures'

// One set of components: a boxed search field with its glass, one "In preparation" badge, and a
// small arrow on every card's action that shows it leads on without hover on a touch screen.

/** A field is a 48 px box, ruled on all four sides, with the glass inside it. */
async function expectBoxedField(input: Locator) {
  await expect(input).toBeVisible()
  const field = await input.evaluate((element) => {
    const style = getComputedStyle(element)
    const glass = element.parentElement?.querySelector('svg')?.getBoundingClientRect()
    const box = element.getBoundingClientRect()
    return {
      height: box.height,
      sides: [
        style.borderTopWidth,
        style.borderRightWidth,
        style.borderBottomWidth,
        style.borderLeftWidth,
      ],
      glassInside:
        !!glass &&
        glass.left >= box.left &&
        glass.right <= box.right &&
        glass.top >= box.top &&
        glass.bottom <= box.bottom,
    }
  })
  expect(field.height).toBeGreaterThanOrEqual(48)
  for (const side of field.sides) expect(side).not.toBe('0px')
  expect(field.glassInside, 'the glass sits inside the box').toBe(true)
}

test('the site search field is a boxed field with its glass', async ({ page }) => {
  await gotoReady(page, '/search/')
  await expectBoxedField(page.getByRole('main').getByRole('searchbox').first())
})

test('References’ quick find is a boxed field, and Clear empties it', async ({ page }) => {
  await gotoReady(page, '/library/references/')
  await expect(page.getByRole('toolbar', { name: 'Jump to a letter' })).toBeVisible()
  const field = page.getByRole('main').getByRole('searchbox').first()
  await expectBoxedField(field)
  await expect(page.getByRole('button', { name: 'Clear', exact: true })).toHaveCount(0)
  await field.fill('yoga')
  const clear = page.getByRole('button', { name: 'Clear', exact: true })
  await clear.click()
  await expect(field).toHaveValue('')
  await expect(field).toBeFocused()
})

test('every “In preparation” badge wears one style', { tag: '@one-width' }, async ({ page }) => {
  await gotoReady(page, '/questionnaires/')
  const badges = page.getByRole('main').getByText('In preparation', { exact: true })
  expect(await badges.count()).toBeGreaterThan(1)
  const looks = await badges.evaluateAll((all) =>
    all.map((badge) => {
      const style = getComputedStyle(badge)
      return `${style.backgroundColor} ${style.color}`
    }),
  )
  expect(new Set(looks).size).toBe(1)
})

test(
  'a card’s action ends in an arrow, which its name leaves out',
  { tag: '@one-width' },
  async ({ page }) => {
    await gotoReady(page, '/topics/mind/')
    const action = page
      .getByRole('main')
      .getByRole('link', { name: /^Read about/ })
      .first()
    await expect(action).toHaveAccessibleName(/^Read about [^→]*$/)
    const arrow = await action.evaluate((link) => getComputedStyle(link, '::before').content)
    expect(arrow).toContain('→')
  },
)
