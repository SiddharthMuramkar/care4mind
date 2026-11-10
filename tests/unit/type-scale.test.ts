import { globSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { customProperties } from '@/styles/contrast'

const tokens = customProperties(readFileSync('src/styles/globals.css', 'utf8'))

/** A rem or px length, in px at the browser's default 16 px root. */
function px(length: string): number {
  const match = /^(-?\d*\.?\d+)(rem|px)$/.exec(length.trim())
  if (!match) throw new Error(`expected a rem or px length, got ${length}`)
  return Number(match[1]) * (match[2] === 'rem' ? 16 : 1)
}

/** A type token's size in px on a screen `width` px wide: a fixed length, or a clamp() of rem + vw. */
function sizeAt(name: string, width: number): number {
  const value = tokens[name]
  if (!value) throw new Error(`${name} is not declared`)
  const fluid = /^clamp\(([^,]+),\s*([\d.]+rem)\s*\+\s*([\d.]+)vw,\s*([^)]+)\)$/.exec(value)
  if (!fluid) return px(value)
  const [, min = '', base = '', vw = '', max = ''] = fluid
  return Math.min(Math.max(px(base) + (Number(vw) * width) / 100, px(min)), px(max))
}

/** Every width from a narrow phone to a wide screen, a pixel apart. */
const WIDTHS = Array.from({ length: 1920 - 320 + 1 }, (_, index) => 320 + index)

describe('the type scale', () => {
  it('steps down at every width: the homepage’s title, a page’s, a section’s, a sub-section’s', () => {
    const steps = ['--text-display', '--text-page-title', '--text-section', '--text-subsection']
    for (const width of WIDTHS) {
      const sizes = steps.map((step) => sizeAt(step, width))
      for (let index = 1; index < sizes.length; index += 1) {
        expect(
          sizes[index],
          `${steps[index]} under ${steps[index - 1]} at ${width} px`,
        ).toBeLessThan(sizes[index - 1] ?? 0)
      }
    }
  })

  it('sets long-form reading text at 18 px on a phone and 20 px on a wide screen', () => {
    expect(sizeAt('--text-reading', 360)).toBeCloseTo(18.06, 1)
    expect(sizeAt('--text-reading', 1440)).toBe(20)
  })

  it('never goes under 15 px', () => {
    const steps = Object.keys(tokens).filter((name) => name.startsWith('--text-'))
    expect(steps.length).toBeGreaterThan(5)
    for (const step of steps)
      for (const width of [320, 1920]) expect(sizeAt(step, width), step).toBeGreaterThanOrEqual(15)
  })

  it('leaves no module a font size under 15 px', () => {
    const hits: string[] = []
    for (const file of globSync('src/**/*.module.css')) {
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      for (const [, length = ''] of css.matchAll(/font-size:\s*(\d*\.?\d+(?:rem|px))\s*[;}]/g)) {
        if (px(length) < 15) hits.push(`${file}: ${length}`)
      }
    }
    expect(hits).toEqual([])
  })
})

describe('press feedback', () => {
  // A press answers within the span a small change of state takes: soon enough to feel direct,
  // long enough to be seen.
  it('takes 120 to 180 ms', () => {
    const duration = /^(\d+)ms$/.exec(tokens['--duration-instant'] ?? '')
    expect(Number(duration?.[1])).toBeGreaterThanOrEqual(120)
    expect(Number(duration?.[1])).toBeLessThanOrEqual(180)
  })
})
