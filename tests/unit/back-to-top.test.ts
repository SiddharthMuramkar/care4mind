import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

// Back to top stands at the screen's lower right. On a phone with a home bar or rounded corners
// that corner is outside the safe area, so each of its offsets adds the matching inset. A browser
// test can't give the page a notch of its own, so this reads the stylesheet.

const css = readFileSync('src/components/BackToTop/BackToTop.module.css', 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
)

/** Every value the stylesheet gives one side's offset, at any width. */
const offsets = (side: 'bottom' | 'right') =>
  [...css.matchAll(new RegExp(`(?:^|[\\s;{])${side}:\\s*([^;]+);`, 'g'))].map(([, value = '']) =>
    value.trim(),
  )

describe('Back to top', () => {
  it.each(['bottom', 'right'] as const)(
    'keeps its %s edge inside the safe area at every width',
    (side) => {
      const values = offsets(side)
      expect(values.length).toBeGreaterThan(0)
      for (const value of values) {
        expect(value).toMatch(
          new RegExp(`^calc\\([\\d.]+rem \\+ env\\(safe-area-inset-${side}, 0px\\)\\)$`),
        )
      }
    },
  )
})
