import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

// wcag22aa must be asked for explicitly, or axe skips its WCAG 2.2 rule (target size, 2.5.8).
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/** Scan what is on screen now; open menus, popovers and panels before calling it. */
export async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  const summary = results.violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target.join(' ')),
  }))
  expect(summary).toEqual([])
}
