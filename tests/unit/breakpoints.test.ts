import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/** The widths a layout may change at, in rem. Custom properties can't be read in a media query, so the set lives here. */
const breakpoints = [30, 48, 64, 80]

const cssFiles = readdirSync('src', { withFileTypes: true, recursive: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
  .map((entry) => join(entry.parentPath, entry.name))

/** Each width feature in a file's media queries, with where it was written. */
function widthFeatures() {
  const found: { file: string; feature: string }[] = []
  for (const file of cssFiles) {
    const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const query of css.matchAll(/@media([^{]*)\{/g)) {
      for (const feature of (query[1] ?? '').matchAll(/\(([^()]*width[^()]*)\)/g)) {
        found.push({ file, feature: (feature[1] ?? '').trim() })
      }
    }
  }
  return found
}

describe('breakpoints', () => {
  const features = widthFeatures()

  it('finds the width queries it checks', () => {
    expect(features.length).toBeGreaterThan(30)
  })

  it('writes each width query in range syntax, at or above a breakpoint or below it', () => {
    const wrong = features
      .filter(({ feature }) => {
        const match = /^width (>=|<) ([\d.]+)rem$/.exec(feature)
        return !match || !breakpoints.includes(Number(match[2]))
      })
      .map(({ file, feature }) => `${file}: (${feature})`)
    expect(wrong).toEqual([])
  })
})
