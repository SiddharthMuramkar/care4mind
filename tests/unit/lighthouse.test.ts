import { createRequire } from 'node:module'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

interface LighthouseConfig {
  ci: {
    collect: { numberOfRuns: number }
    assert: { assertions: Record<string, [string, Record<string, unknown>]> }
  }
}

const config = createRequire(import.meta.url)(resolve('lighthouserc.cjs')) as LighthouseConfig

describe('Lighthouse CI', () => {
  it('runs each page five times', () => {
    expect(config.ci.collect.numberOfRuns).toBe(5)
  })

  // One garbage-collection pause in one run must not fail the budget.
  it('judges Total Blocking Time by the median of every run, within 200 ms', () => {
    expect(config.ci.assert.assertions['total-blocking-time']).toEqual([
      'error',
      { maxNumericValue: 200, aggregationMethod: 'median' },
    ])
  })
})
