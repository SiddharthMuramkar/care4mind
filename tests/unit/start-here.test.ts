import { describe, expect, it } from 'vitest'

import { startHere } from '@/components/start/start-here'
import { concepts } from '@/content'

describe('the Start here record', () => {
  it('names only Concepts that have records as first reads', async () => {
    const slugs = new Set((await concepts.list()).map((concept) => concept.slug))
    expect(startHere.firstReads.length).toBeGreaterThan(0)
    for (const slug of startHere.firstReads) expect(slugs).toContain(slug)
  })

  it('lists as drafted only fields the record has', () => {
    for (const field of startHere.provenance.drafted ?? []) expect(startHere).toHaveProperty(field)
  })
})
