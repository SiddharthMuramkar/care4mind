import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

// wcag22aa must be asked for explicitly, or axe skips its WCAG 2.2 rule (target size, 2.5.8).
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Tagged best-practice only, so the WCAG tags alone never run them. The rest of best-practice
// is left out: `region` trips on portalled popups and toasts.
export const STRUCTURE_RULES = [
  'heading-order',
  'landmark-unique',
  'landmark-one-main',
  'skip-link',
  'aria-dialog-name',
  'empty-heading',
]

/**
 * Text whose contrast axe can't settle (an `incomplete` color-contrast result), reviewed: why axe
 * gave up (its message keys) and the element it sits in. Any other unsettled text fails the scan.
 */
export const REVIEWED_CONTRAST = [
  {
    keys: ['bgGradient'],
    within: 'a:not([class])',
    reason: 'A running-text link’s accent underline is a gradient sized to nothing until hover.',
  },
  {
    keys: ['bgGradient'],
    within: 'div:has(> table)',
    reason: 'A table’s scroll shadows are gradients at its edges; its text sits on the paper.',
  },
  {
    keys: ['pseudoContent'],
    within: 'header',
    reason: 'The header’s scroll shadow is a pseudo-element hung below it, not behind its text.',
  },
  {
    keys: ['shortTextContent'],
    within: '[class*="_wordmark"], [class*="_letter"], figcaption',
    reason: 'One glyph, which axe won’t judge: the wordmark’s 4, A–Z letters, verse numbers.',
  },
  {
    keys: ['bgOverlap', 'elmPartiallyObscured', 'elmPartiallyObscuring'],
    within: '[class*="_entries"]',
    reason: 'The sticky header and band of letters pass over A–Z entries as axe scrolls the list.',
  },
  {
    keys: ['elmPartiallyObscured'],
    within: 'button[data-chip]',
    reason: 'A filter chip scrolled to the edge of its row is clipped there, on the same paper.',
  },
  {
    keys: ['imgNode', 'bgGradient', 'elmPartiallyObscuring'],
    within: '[class*="_plate"]',
    reason: 'The map’s labels sit on its drawn plate, an SVG of lines over the paper.',
  },
]

type Unsettled = { target: string; key: string; message: string }

/** The unsettled nodes that no reviewed entry covers. */
async function unreviewed(page: Page, nodes: Unsettled[]) {
  const covered = await page.evaluate(
    ({ nodes, reviewed }) =>
      nodes.map(({ target, key }) => {
        const element = document.querySelector(target)
        return reviewed.some(({ keys, within }) => keys.includes(key) && element?.closest(within))
      }),
    { nodes, reviewed: REVIEWED_CONTRAST },
  )
  return nodes.filter((_, index) => !covered[index])
}

/**
 * Scan what is on screen now; open menus, popovers and panels before calling it. A failure
 * lists each rule broken, what it asks for and where; `where` names the page and width too.
 */
export async function expectNoAxeViolations(page: Page, where?: string) {
  const results = await new AxeBuilder({ page })
    .options({
      runOnly: { type: 'tag', values: WCAG_TAGS },
      rules: Object.fromEntries(STRUCTURE_RULES.map((rule) => [rule, { enabled: true }])),
    })
    .analyze()
  const summary = results.violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.map((node) => node.target.join(' ')),
  }))
  expect(summary, where).toEqual([])

  const unsettled = results.incomplete
    .filter(({ id }) => id === 'color-contrast')
    .flatMap(({ nodes }) =>
      nodes.map((node) => {
        const check = node.any[0]
        const data = check?.data as { messageKey?: string } | null | undefined
        return {
          target: node.target.join(' '),
          key: data?.messageKey ?? '',
          message: check?.message ?? '',
        }
      }),
    )
  const label = where ?? page.url()
  if (unsettled.length > 0)
    await test.info().attach(`${label}: unsettled contrast`, {
      body: JSON.stringify(unsettled, null, 2),
      contentType: 'application/json',
    })
  expect(await unreviewed(page, unsettled), `${label}: unsettled contrast, not reviewed`).toEqual(
    [],
  )
}
