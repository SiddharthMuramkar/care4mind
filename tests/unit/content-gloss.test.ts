import { describe, expect, it } from 'vitest'

import { CONTENT_KINDS } from '@/content/schema'
import { localSource } from '@/content/source'

/** Every `gloss` field anywhere in a record, its blocks and table rows included. */
function glossesOf(value: unknown, path: string, out: { path: string; text: string }[]) {
  if (Array.isArray(value)) value.forEach((item, i) => glossesOf(item, `${path}[${i}]`, out))
  else if (value && typeof value === 'object') {
    for (const [key, field] of Object.entries(value)) {
      if (key === 'provenance') continue
      if (key === 'gloss' && typeof field === 'string')
        out.push({ path: `${path}.gloss`, text: field })
      else glossesOf(field, `${path}.${key}`, out)
    }
  }
  return out
}

describe('glosses', () => {
  it('every gloss of every record kind starts with a capital letter', async () => {
    const records = (
      await Promise.all(CONTENT_KINDS.map((kind) => localSource.records(kind)))
    ).flat()
    const fromBlocks = records.flatMap((record) => glossesOf(record, `${record.kind}`, []))
    const concepts = await localSource.records('concept')
    const glosses = concepts.flatMap((concept) => {
      const out = glossesOf(concept, concept.slug, [])
      if (concept.name.english)
        out.push({ path: `${concept.slug}.name.english`, text: concept.name.english })
      return out
    })
    glosses.push(...fromBlocks.filter((g) => !g.path.startsWith('concept')))
    expect(glosses.length).toBeGreaterThan(0)
    const lower = glosses.filter(({ text }) => !/^\p{Lu}/u.test(text))
    expect(lower).toEqual([])
  })
})
