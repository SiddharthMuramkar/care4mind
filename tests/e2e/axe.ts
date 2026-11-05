import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

// wcag22aa must be asked for explicitly, or axe skips its WCAG 2.2 rule (target size, 2.5.8).
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Structural rules axe tags only best-practice, so no WCAG tag run reaches them; region stays out, as portalled popups and toasts make it noise.
export const STRUCTURAL_RULES = [
  'heading-order',
  'landmark-unique',
  'landmark-one-main',
  'skip-link',
  'aria-dialog-name',
  'empty-heading',
]

// Why axe may leave a contrast unsettled, reviewed: a node passes only under one of these reasons, and its colour judgement lives in the contrast test's token pairs.
const UNSETTLED_CONTRAST: readonly { why: string; reason: string }[] = [
  {
    why: 'shortTextContent',
    reason: 'one character of text, as an A–Z letter; its token pair is in the contrast test',
  },
  {
    why: 'pseudoContent',
    reason: 'a decorative pseudo-element, as ink-spread, whose pairs are in the contrast test',
  },
  {
    why: 'bgGradient',
    reason:
      'a gradient in the background stack, as a link’s resting underline; its text colours are tokens',
  },
  {
    why: 'bgOverlap',
    reason: 'covered where it sits, by the sticky header or rail; its colours settle uncovered',
  },
  {
    why: 'elmPartiallyObscured',
    reason: 'partly covered where it sits; its colours settle uncovered',
  },
  {
    why: 'imgNode',
    reason:
      'a label set over a drawing, as the Concept map’s names over its lines; its colours are tokens',
  },
  {
    why: 'elmPartiallyObscuring',
    reason: 'partly covers another element where it sits; its colours settle clear of it',
  },
]

/**
 * Scan what is on screen now; open menus, popovers and panels before calling it. A failure
 * lists each rule broken, what it asks for and where; `where` names the page and width too.
 */
export async function expectNoAxeViolations(page: Page, where?: string) {
  // One run takes tags or rules, never both, so the structural rules run beside the WCAG tags.
  const wcag = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  const structural = await new AxeBuilder({ page }).withRules(STRUCTURAL_RULES).analyze()
  const violations: {
    rule: string
    impact: string | null | undefined
    help: string
    targets: string[]
  }[] = [...wcag.violations, ...structural.violations].map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.map((node) => node.target.join(' ')),
  }))

  const unsettled = wcag.incomplete
    .filter((result) => result.id === 'color-contrast')
    .flatMap((result) =>
      result.nodes.map((node) => ({
        why: String(
          (node.any[0]?.data as { messageKey?: string } | undefined)?.messageKey ?? 'unknown',
        ),
        target: node.target.join(' '),
      })),
    )
  const unreviewed: string[] = []
  for (const { why, target } of unsettled) {
    const reviewed = UNSETTLED_CONTRAST.find((entry) => entry.why === why)
    console.log(
      `axe color-contrast unsettled${where ? ` (${where})` : ''}: ${why} ${target}${reviewed ? ` — ${reviewed.reason}` : ''}`,
    )
    if (!reviewed) unreviewed.push(`${why}: ${target}`)
  }
  if (unreviewed.length > 0) {
    violations.push({
      rule: 'color-contrast',
      impact: 'unsettled',
      help: 'axe could not settle this contrast; fix the colour or record its reason above',
      targets: unreviewed,
    })
  }
  expect(violations, where).toEqual([])
}
