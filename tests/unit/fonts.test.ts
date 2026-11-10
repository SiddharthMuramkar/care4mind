import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { FONT_FILES, LATIN_FONTS, substitutionFeatures } from './font-files'

/** The OpenType feature each figure style of `font-variant-numeric` turns on. */
const FIGURE_FEATURES: Record<string, string> = {
  'lining-nums': 'lnum',
  'oldstyle-nums': 'onum',
  'proportional-nums': 'pnum',
  'tabular-nums': 'tnum',
  'diagonal-fractions': 'frac',
  'stacked-fractions': 'afrc',
  ordinal: 'ordn',
  'slashed-zero': 'zero',
}

/** The figure features the site's styles ask for, from every `font-variant-numeric` they set. */
function askedForFigureFeatures(): string[] {
  const values = readdirSync('src', { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
    .flatMap((entry) => [
      ...readFileSync(join(entry.parentPath, entry.name), 'utf8').matchAll(
        /font-variant-numeric:\s*([^;}]+)/g,
      ),
    ])
    .flatMap((match) => (match[1] ?? '').trim().split(/\s+/))
    .filter((value) => value !== 'normal')
  return [...new Set(values)].map((value) => FIGURE_FEATURES[value] ?? `an unknown “${value}”`)
}

/** What the five faces weighed before the figure features were kept and unused ranges trimmed. */
const BEFORE = 299_992
/** What they weigh now. A rebuild may shrink them; one that grows them raises this on purpose. */
const BUDGET = 279_920

describe('the self-hosted fonts', () => {
  it('asks only for figure styles a font feature sets', () => {
    const asked = askedForFigureFeatures()
    expect(asked.length).toBeGreaterThan(0)
    expect(asked.filter((feature) => feature.startsWith('an unknown'))).toEqual([])
  })

  // Without the feature in the file, the browser sets the font's own figures and nothing tells.
  it.each(LATIN_FONTS)('keeps every figure feature the styles ask for, in %s', (file) => {
    const kept = substitutionFeatures(file)
    expect(askedForFigureFeatures().filter((feature) => !kept.has(feature))).toEqual([])
  })

  it('holds the five faces within their budget, below what they weighed before', () => {
    const total = FONT_FILES.reduce((sum, file) => sum + statSync(file).size, 0)
    expect(BUDGET).toBeLessThanOrEqual(BEFORE)
    expect(total).toBeLessThanOrEqual(BUDGET)
  })
})
