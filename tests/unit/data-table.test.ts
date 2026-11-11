import { readFileSync } from 'node:fs'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Blocks, Sections, Text } from '@/components/prose'
import { library, type BlockView, type PageView, type SectionView } from '@/content'

// A data table as the page draws it: every one stacks as cards on a phone, keeps a focusable
// frame named by its caption, and lets a line break after a slash between two words.

type Table = Extract<BlockView, { kind: 'table' }>

const table: Table = {
  kind: 'table',
  id: 'approaches',
  caption: 'Approaches/schools of therapy',
  columns: ['Approach', 'Indian/Yogic Understanding'],
  rows: [
    {
      head: 'Psychoanalysis/Psychodynamic Therapy',
      cells: ['Explores mind/body links, and either / or choices.'],
    },
  ],
}

const methods = (await library.get('methods')) as PageView
const tablesOf = (sections: readonly SectionView[]) =>
  sections.flatMap(({ blocks }) => blocks.filter((block): block is Table => block.kind === 'table'))

const [first] = methods.sections
if (!first) throw new Error('Therapy approaches has sections.')

/** A section of Therapy approaches holding `blocks`, in the role given. */
const section = (blocks: readonly BlockView[], role?: SectionView['role']): SectionView => ({
  ...first,
  blocks,
  role,
})

const drawn = (sections: readonly SectionView[]) =>
  renderToStaticMarkup(createElement(Sections, { sections }))

/** The markup with every tag taken out: the words a reader is given. */
const words = (markup: string) => markup.replace(/<[^>]*>/g, '')

describe('a data table', () => {
  it('stacks as cards on a phone in any section, not only a comparison', () => {
    const css = readFileSync('src/components/prose/Prose.module.css', 'utf8')
    const phone = css.slice(css.indexOf('@media screen and (width < 48rem)'))
    expect(phone).toMatch(/^@media screen and \(width < 48rem\) \{\s*\.frame \{/)
    expect(phone).toContain('content: attr(data-label)')
    for (const role of [undefined, 'applications', 'comparison'] as const) {
      const html = drawn([section([table], role)])
      // Its head row is read rather than seen there, and each cell carries its column's name.
      expect(html, role).toMatch(/<thead class="sr-only [^"]+">/)
      expect(html, role).toContain('data-label="Indian/Yogic Understanding"')
    }
  })

  it('stands in a focusable region its caption names', () => {
    const html = renderToStaticMarkup(createElement(Blocks, { blocks: [table] }))
    expect(html).toContain('role="region" aria-labelledby="approaches-caption" tabindex="0"')
    expect(html).toContain('<caption id="approaches-caption"')
  })

  it('breaks a line only after a slash between two words, in every cell, and keeps the words', () => {
    const html = renderToStaticMarkup(createElement(Blocks, { blocks: [table] }))
    for (const joined of [
      'Approaches/<wbr/>schools',
      'Indian/<wbr/>Yogic',
      'Psychoanalysis/<wbr/>Psychodynamic',
      'mind/<wbr/>body',
    ])
      expect(html).toContain(joined)
    // A slash with a space after it is a break already.
    expect(html).toContain('either / or')
    expect(html.match(/<wbr\/>/g)).toHaveLength(4)
    expect(words(html)).toContain('Psychoanalysis/Psychodynamic Therapy')
    expect(words(html)).toContain('Explores mind/body links, and either / or choices.')
  })

  it('sets both Therapy approaches tables with a break after each slash in their row heads', () => {
    const tables = tablesOf(methods.sections)
    expect(tables).toHaveLength(2)
    const html = renderToStaticMarkup(createElement(Blocks, { blocks: tables }))
    expect(html).toContain('Psychoanalysis/<wbr/>Psychodynamic Therapy')
    expect(html).toContain('Integrative/<wbr/>Holistic Therapy')
  })
})

describe('running text outside a table', () => {
  it('keeps its slashes as they are, with no break added', () => {
    expect(renderToStaticMarkup(createElement(Text, { text: 'mind/body' }))).toBe('mind/body')
  })

  it('still tags Devanagari beside the breaks a table adds', () => {
    const html = renderToStaticMarkup(
      createElement(Text, { text: 'Kama/desire (काम)', breakAfterSlash: true }),
    )
    expect(html).toBe('Kama/<wbr/>desire (<span lang="sa-Deva">काम</span>)')
  })
})
