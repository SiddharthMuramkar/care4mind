import type { Locator, Page } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'

// Front-end-site ticket 10: taking the KarmaYoga Scale (C4, D16). Local runs and CI build with the
// preview flag on, so the flow exists. What is checked is what a visitor sees and does: parts,
// answers, focus, history, the review, the end screen, and that nothing is stored or sent.

const INTRO = '/questionnaires/karmayoga-scale/'
const FLOW = '/questionnaires/karmayoga-scale/take/'

/** The four parts in the record's settings order, with how many statements each holds. */
const PARTS = [
  { title: 'Everyday Experience - 1', count: 12 },
  { title: 'Everyday Experience - 2', count: 6 },
  { title: 'Experience Related to Work - 1', count: 9 },
  { title: 'Experience Related to Work - 2', count: 18 },
] as const

const FREQUENCY = ['Always', 'Often', 'Sometimes', 'Rarely', 'Never']
const AGREEMENT = [
  'Strongly Disagree',
  'Disagree',
  'Neither agree nor disagree',
  'Agree',
  'Strongly Agree',
]

const statements = (page: Page) => page.getByRole('radiogroup')
const partHeading = (page: Page, part: number) =>
  page.getByRole('heading', { level: 2, name: PARTS[part - 1]?.title })
const progress = (page: Page) => page.getByRole('progressbar', { name: 'Your progress' })
const next = (page: Page) => page.getByRole('button', { name: 'Next', exact: true })

/** Answer every statement on screen: each takes the option `pick` gives its position. */
async function answerPart(page: Page, pick: (position: number) => number = () => 0) {
  const groups = statements(page)
  await expect(groups.first()).toBeVisible()
  const count = await groups.count()
  for (let position = 0; position < count; position++) {
    await groups.nth(position).getByRole('radio').nth(pick(position)).check()
  }
}

/** From part 1, answer every part and go on to the review. */
async function toReview(page: Page, pick?: (position: number) => number) {
  for (let part = 1; part <= PARTS.length; part++) {
    await expect(partHeading(page, part)).toBeVisible()
    await answerPart(page, pick)
    await next(page).click()
  }
  await expect(page.getByRole('heading', { level: 2, name: 'Review your answers' })).toBeVisible()
}

async function toEnd(page: Page) {
  await toReview(page)
  await page.getByRole('button', { name: 'Finish' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Your result' })).toBeVisible()
}

/** Press Tab until `target` has focus, as a keyboard user would. */
async function tabTo(page: Page, target: Locator, limit = 80) {
  for (let presses = 0; presses < limit; presses++) {
    if (await target.evaluate((element) => element === document.activeElement)) return
    await page.keyboard.press('Tab')
  }
  await expect(target).toBeFocused()
}

const focusedRadio = (page: Page) => page.locator('input[type="radio"]:focus')

test.describe('the KarmaYoga flow', () => {
  test('is taken by keyboard alone, from Start to the end screen', async ({ page }) => {
    await gotoReady(page, INTRO)
    await tabTo(page, page.getByRole('link', { name: 'Start the Questionnaire' }), 120)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(FLOW)
    await expect(page.locator('html')).toHaveAttribute('data-hydrated')

    for (let part = 1; part <= PARTS.length; part++) {
      await expect(partHeading(page, part)).toBeVisible()
      const groups = statements(page)
      await expect(groups).toHaveCount(PARTS[part - 1]?.count ?? 0)
      for (let position = 0; position < (PARTS[part - 1]?.count ?? 0); position++) {
        const group = groups.nth(position)
        await tabTo(page, group.getByRole('radio').first())
        await page.keyboard.press('Space')
        // The arrow keys move within the statement's options, choosing as they go.
        await page.keyboard.press('ArrowDown')
        await expect(group.getByRole('radio').nth(1)).toBeChecked()
        await expect(group.getByRole('radio').nth(1)).toBeFocused()
      }
      // Choosing never moved on, and single keys do nothing.
      const before = page.url()
      await page.keyboard.press('n')
      await page.keyboard.press('Enter')
      await expect(focusedRadio(page)).toHaveCount(1)
      expect(page.url()).toBe(before)
      await expect(partHeading(page, part)).toBeVisible()

      await tabTo(page, next(page))
      await page.keyboard.press('Enter')
    }

    const review = page.getByRole('heading', { level: 2, name: 'Review your answers' })
    await expect(review).toBeFocused()
    await tabTo(page, page.getByRole('button', { name: 'Finish' }), 120)
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { level: 2, name: 'Your result' })).toBeFocused()
  })

  test('sets out each part with its instructions, statements and options in the source order', async ({
    page,
  }) => {
    await gotoReady(page, FLOW)
    await expect(partHeading(page, 1)).toBeVisible()
    await expect(page.getByText(/^Upcoming is a collection of statements/)).toBeVisible()
    await expect(statements(page)).toHaveCount(12)
    const failure = page.getByRole('radiogroup', { name: 'Failure makes me feel pessimistic.' })
    await expect(failure.locator('legend')).toHaveText('Failure makes me feel pessimistic.')
    expect(
      await failure
        .getByRole('radio')
        .evaluateAll((radios) => radios.map((radio) => (radio as HTMLInputElement).value)),
    ).toEqual(FREQUENCY)
    for (const radio of await failure.getByRole('radio').all()) {
      await expect(radio).toHaveAccessibleName(/./)
      expect((await radio.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44)
    }

    for (let part = 1; part < 4; part++) {
      await answerPart(page)
      await next(page).click()
    }
    await expect(partHeading(page, 4)).toBeVisible()
    await expect(page.getByText(/^Next is the collection of statements/)).toBeVisible()
    const options = await statements(page).evaluateAll((groups) =>
      groups.map((group) => [...group.querySelectorAll('input')].map((input) => input.value)),
    )
    // Items 34–42 list Strongly Agree first, as the source does; the rest run the other way.
    expect(options).toHaveLength(18)
    expect(options.slice(0, 9)).toEqual(Array(9).fill([...AGREEMENT].reverse()))
    expect(options.slice(9)).toEqual(Array(9).fill(AGREEMENT))
    await expect(statements(page).first()).toHaveAccessibleName(
      'I cherish the moments of results much more than the moments of efforts.',
    )
  })

  test('shows how far it has come in words, beside a tally hidden from assistive technology', async ({
    page,
  }) => {
    await gotoReady(page, FLOW)
    await expect(progress(page)).toHaveAttribute('aria-valuetext', 'Part 1 of 4 · 0 of 45 answered')
    await expect(progress(page)).toContainText('Part 1 of 4 · 0 of 45 answered')
    await expect(progress(page)).not.toHaveAttribute('aria-live')
    await answerPart(page)
    await next(page).click()
    await statements(page).nth(0).getByRole('radio').first().check()
    await statements(page).nth(1).getByRole('radio').first().check()
    await expect(progress(page)).toHaveAttribute(
      'aria-valuetext',
      'Part 2 of 4 · 14 of 45 answered',
    )
    await expect(progress(page)).toContainText('Part 2 of 4 · 14 of 45 answered')
    await expect(progress(page)).toHaveAttribute('aria-valuenow', '14')
    await expect(progress(page)).toHaveAttribute('aria-valuemax', '45')
    // The tally: 45 rules in groups of 12, 6, 9 and 18, 14 of them inked, all decoration.
    const tally = progress(page).locator('[aria-hidden="true"]').first()
    expect(
      await tally.evaluate((element) =>
        [...element.children].map((group) => group.children.length),
      ),
    ).toEqual([12, 6, 9, 18])
    await expect(tally.locator('[data-inked]')).toHaveCount(14)
  })

  test('refuses an unfinished part with focus on the summary, keeping every answer', async ({
    page,
  }) => {
    await gotoReady(page, FLOW)
    const groups = statements(page)
    await groups.nth(0).getByRole('radio', { name: 'Often' }).check()
    await groups.nth(2).getByRole('radio', { name: 'Never' }).check()
    const before = page.url()
    await next(page).click()

    await expect(
      page.getByRole('region', { name: '10 statements have no answer yet' }),
    ).toBeFocused()
    const summary = page.getByRole('region', { name: /statements? ha(s|ve) no answer yet$/ })
    await expect(summary.getByRole('link')).toHaveCount(10)
    expect(page.url()).toBe(before)
    await expect(partHeading(page, 1)).toBeVisible()
    await expect(groups.nth(0).getByRole('radio', { name: 'Often' })).toBeChecked()
    await expect(groups.nth(2).getByRole('radio', { name: 'Never' })).toBeChecked()
    await expect(groups.nth(0)).not.toHaveAttribute('aria-invalid')
    await expect(groups.nth(1)).toHaveAttribute('aria-invalid', 'true')
    await expect(groups.nth(1)).toHaveAccessibleDescription('Choose an answer to this statement.')
    await expect(groups.nth(1).getByText('Choose an answer to this statement.')).toBeVisible()
    await expectNoAxeViolations(page, 'the error state')

    // Each error leads to its statement.
    const second = groups.nth(1)
    const name = (await second.locator('legend').textContent()) ?? ''
    await summary.getByRole('link', { name }).click()
    await expect(second.getByRole('radio').first()).toBeFocused()
    await expect(second.getByRole('radio').first()).toBeInViewport()
    await page.keyboard.press('Space')
    await expect(second).not.toHaveAttribute('aria-invalid')
    await expect(summary.getByRole('link')).toHaveCount(9)
  })

  test('goes back a part with Back and with the browser, and forward again, keeping every answer', async ({
    page,
  }) => {
    await gotoReady(page, FLOW)
    await answerPart(page, (position) => position % 5)
    await next(page).click()
    await expect(page).toHaveURL(`${FLOW}?step=part-2`)
    await expect(partHeading(page, 2)).toBeFocused()
    await statements(page).nth(3).getByRole('radio', { name: 'Agree', exact: true }).check()

    await page.goBack()
    await expect(partHeading(page, 1)).toBeVisible()
    for (let position = 0; position < 12; position++) {
      await expect(
        statements(page)
          .nth(position)
          .getByRole('radio')
          .nth(position % 5),
      ).toBeChecked()
    }
    await page.goForward()
    await expect(page).toHaveURL(`${FLOW}?step=part-2`)
    await expect(partHeading(page, 2)).toBeVisible()
    await expect(
      statements(page).nth(3).getByRole('radio', { name: 'Agree', exact: true }),
    ).toBeChecked()

    // The flow's own Back returns a part too; Next goes on again with everything kept.
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await expect(partHeading(page, 1)).toBeFocused()
    await expect(page).toHaveURL(`${FLOW}?step=part-1`)
    await expect(statements(page).nth(11).getByRole('radio').nth(1)).toBeChecked()
    await next(page).click()
    await expect(partHeading(page, 2)).toBeFocused()
    await expect(
      statements(page).nth(3).getByRole('radio', { name: 'Agree', exact: true }),
    ).toBeChecked()
  })

  test('starts again at part 1 on a reload, with nothing in memory', async ({ page }) => {
    page.on('dialog', (dialog) => void dialog.accept())
    await gotoReady(page, FLOW)
    await answerPart(page)
    await next(page).click()
    await expect(page).toHaveURL(`${FLOW}?step=part-2`)
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-hydrated')
    await expect(partHeading(page, 1)).toBeVisible()
    await expect(page).toHaveURL(`${FLOW}?step=part-1`)
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
    await expect(progress(page)).toHaveAttribute('aria-valuetext', 'Part 1 of 4 · 0 of 45 answered')
  })

  test('reviews every answer by part, and Change returns to its statement', async ({ page }) => {
    await gotoReady(page, FLOW)
    await toReview(page, (position) => position % 5)
    for (const { title } of PARTS) {
      await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible()
    }
    const changes = page.getByRole('link', { name: /^Change your answer to/ })
    await expect(changes).toHaveCount(45)
    await expectNoAxeViolations(page, 'the review')

    const statement = 'I cherish the moments of results much more than the moments of efforts.'
    const row = page.locator('dl > div').filter({ hasText: statement })
    await expect(row.getByRole('definition').first()).toHaveText('Strongly Agree')
    await page.getByRole('link', { name: `Change your answer to “${statement}”` }).click()
    await expect(page).toHaveURL(`${FLOW}?step=part-4`)
    await expect(partHeading(page, 4)).toBeVisible()
    const group = page.getByRole('radiogroup', { name: statement })
    await expect(group.getByRole('radio', { name: 'Strongly Agree' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await next(page).click()
    await expect(row.getByRole('definition').first()).toHaveText('Agree')
  })

  test('ends on a placeholder: no number and no band, the limitation, the answers and the source', async ({
    page,
  }) => {
    await gotoReady(page, FLOW)
    await toEnd(page)
    const plate = page.getByRole('figure', { name: 'Placeholder' })
    await expect(plate).toHaveText(
      /The KarmaYoga Scale[’']s scoring rules are with the Psychology expert; your result appears here once they are confirmed\./,
    )
    const end = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Your result' }) })
    expect(await plate.innerText(), 'no score or percentage').not.toMatch(/\d|%/)
    expect(await end.innerText(), 'no band').not.toMatch(/%|\b(High|Moderate|Low)\b/)
    const given = await end.locator('dl dd').allInnerTexts()
    expect(given).toHaveLength(45)
    for (const answer of given) expect([...FREQUENCY, ...AGREEMENT]).toContain(answer)
    await expect(progress(page)).toHaveCount(0)
    await expect(
      page.getByText(/not a clinical test\. It does not diagnose anything/),
    ).toBeVisible()
    await expect(
      page.getByText(/Psychology expert has not reviewed these limitations/),
    ).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: 'Your answers' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: 'Source' })).toBeVisible()
    await expect(end.getByText(/Navare/)).toBeVisible()
    await expect(end.getByRole('link', { name: /Vikṣepa/ })).toHaveAttribute(
      'href',
      '/concepts/vikshepa/',
    )
    await expect(page.getByRole('button', { name: 'Print your answers' })).toBeVisible()
    await expectNoAxeViolations(page, 'the end screen')
  })

  test('prints the placeholder and the answers, without the controls', async ({ page }) => {
    await gotoReady(page, FLOW)
    await toEnd(page)
    await page.emulateMedia({ media: 'print' })
    await expect(page.getByRole('figure', { name: 'Placeholder' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: 'Your answers' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retake' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Print your answers' })).toBeHidden()
  })

  test('asks before Retake: cancel keeps every answer, confirm clears them and returns to part 1', async ({
    page,
  }) => {
    await gotoReady(page, FLOW)
    await toEnd(page)
    const retake = page.getByRole('button', { name: 'Retake' })
    await retake.click()
    const dialog = page.getByRole('alertdialog', { name: 'Start again?' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Keep my answers' })).toBeFocused()
    await dialog.getByRole('button', { name: 'Keep my answers' }).click()
    await expect(dialog).toBeHidden()
    await expect(retake).toBeFocused()
    await expect(page.getByRole('heading', { level: 3, name: 'Your answers' })).toBeVisible()

    await retake.click()
    await dialog.getByRole('button', { name: 'Clear and start again' }).click()
    await expect(dialog).toBeHidden()
    await expect(partHeading(page, 1)).toBeFocused()
    await expect(page).toHaveURL(`${FLOW}?step=part-1`)
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
    await expect(progress(page)).toHaveAttribute('aria-valuetext', 'Part 1 of 4 · 0 of 45 answered')
  })

  test('stores nothing and sends nothing: no answer leaves the page', async ({ page, context }) => {
    const requests: { url: string; method: string }[] = []
    page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }))
    const stored = () =>
      page.evaluate(async () => ({
        local: Object.keys(localStorage),
        session: Object.keys(sessionStorage),
        databases: (await indexedDB.databases()).map(({ name }) => name),
      }))

    await gotoReady(page, INTRO)
    const before = { ...(await stored()), cookies: await context.cookies() }
    await page.getByRole('link', { name: 'Start the Questionnaire' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-hydrated')
    const addresses: string[] = []
    page.on('framenavigated', (frame) => addresses.push(frame.url()))
    await toReview(page, (position) => position % 5)
    addresses.push(page.url())
    await page.getByRole('button', { name: 'Finish' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Your result' })).toBeVisible()
    addresses.push(page.url())

    expect({ ...(await stored()), cookies: await context.cookies() }).toEqual(before)
    const origin = new URL(page.url()).origin
    for (const { url, method } of requests) {
      expect(method, url).toBe('GET')
      expect(new URL(url).origin, url).toBe(origin)
      const address = decodeURIComponent(url)
      for (const answer of [...FREQUENCY, ...AGREEMENT]) expect(address, url).not.toContain(answer)
    }
    for (const address of addresses) {
      expect([...new URL(address).searchParams.keys()].filter((key) => key !== 'step')).toEqual([])
    }
  })

  test('warns before leaving while answers are given and the end screen is not reached', async ({
    page,
  }) => {
    const dialogs: string[] = []
    page.on('dialog', (dialog) => {
      dialogs.push(dialog.type())
      void dialog.accept()
    })
    await gotoReady(page, FLOW)
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-hydrated')
    expect(dialogs, 'nothing to lose yet').toEqual([])

    await statements(page).first().getByRole('radio').first().check()
    await page.reload()
    await expect.poll(() => dialogs).toEqual(['beforeunload'])
    await expect(page.locator('html')).toHaveAttribute('data-hydrated')

    await toEnd(page)
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-hydrated')
    expect(dialogs, 'the end screen reached').toEqual(['beforeunload'])
  })

  test('has no axe violations on any part', async ({ page }) => {
    await gotoReady(page, FLOW)
    for (let part = 1; part <= PARTS.length; part++) {
      await expect(partHeading(page, part)).toBeVisible()
      await expectNoAxeViolations(page, `part ${part}`)
      await answerPart(page)
      await next(page).click()
    }
  })
})

/** Every view transition started, with whether its snapshots moved. */
function recordTransitions(page: Page) {
  return page.addInitScript(() => {
    const transitions: { moved: boolean | null }[] = []
    Object.defineProperty(window, '__transitions', { value: transitions })
    const start = document.startViewTransition.bind(document)
    document.startViewTransition = ((options: Parameters<typeof start>[0]) => {
      const record: { moved: boolean | null } = { moved: null }
      transitions.push(record)
      const transition = start(options)
      transition.ready
        .then(() => {
          record.moved = document.getAnimations().some((animation) => {
            const effect = animation.effect as KeyframeEffect | null
            return (
              /^::view-transition-(old|new)/.test(effect?.pseudoElement ?? '') &&
              Number(effect?.getComputedTiming().duration) > 1
            )
          })
        })
        .catch(() => (record.moved = false))
      return transition
    }) as typeof document.startViewTransition
  })
}

const transitions = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __transitions: { moved: boolean | null }[] }).__transitions,
  )

test.describe('motion', () => {
  test('turns the page between parts, and keeps the end screen still', async ({ page }) => {
    await recordTransitions(page)
    await gotoReady(page, FLOW)
    await answerPart(page)
    await next(page).click()
    await expect(partHeading(page, 2)).toBeVisible()
    await expect.poll(() => transitions(page)).toEqual([{ moved: true }])

    for (let part = 2; part <= PARTS.length; part++) {
      await expect(partHeading(page, part)).toBeVisible()
      await answerPart(page)
      await next(page).click()
    }
    await expect(page.getByRole('heading', { level: 2, name: 'Review your answers' })).toBeVisible()
    const turned = (await transitions(page)).length
    await page.getByRole('button', { name: 'Finish' }).click()
    const end = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Your result' }) })
    await expect(end).toBeVisible()
    await page.waitForTimeout(400)
    expect((await transitions(page)).length, 'no page turn into the end screen').toBe(turned)
    expect(
      await end.evaluate(
        (section) =>
          document.getAnimations().filter((animation) => {
            const target = (animation.effect as KeyframeEffect | null)?.target
            return target && section.contains(target) && animation.playState === 'running'
          }).length,
      ),
      'nothing moves on the end screen',
    ).toBe(0)
  })

  test.describe('reduced', () => {
    test.use({ reducedMotion: 'reduce' })

    test('changes part at once', async ({ page }) => {
      await recordTransitions(page)
      await gotoReady(page, FLOW)
      await answerPart(page)
      await next(page).click()
      await expect(partHeading(page, 2)).toBeVisible()
      await expect
        .poll(async () => (await transitions(page)).every(({ moved }) => moved === false))
        .toBe(true)
    })
  })
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('says the flow needs JavaScript, and leads back to the intro', async ({ page }) => {
    await page.goto(FLOW)
    await expect(
      page.getByRole('heading', { level: 2, name: 'This Questionnaire needs JavaScript' }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Back to what the KarmaYoga Scale is for, and its limits' }),
    ).toHaveAttribute('href', INTRO)
    await expect(statements(page)).toHaveCount(0)
  })
})
