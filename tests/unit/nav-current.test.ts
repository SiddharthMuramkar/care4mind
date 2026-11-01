import { describe, expect, it } from 'vitest'

import { currentFor } from '@/components/nav/current'

describe('which header link is current (aria-current)', () => {
  it('marks a link’s own page as the page, and a page elsewhere as nothing', () => {
    expect(currentFor('/concepts/', '/concepts/')).toBe('page')
    expect(currentFor('/library/', '/concepts/')).toBeUndefined()
  })

  it('reads a pathname without its trailing slash as the same page', () => {
    expect(currentFor('/concepts', '/concepts/')).toBe('page')
  })

  it('marks a page within a section, but not a sibling whose path shares its prefix', () => {
    expect(currentFor('/concepts/atman/', '/texts/', ['/concepts/'])).toBe('true')
    expect(currentFor('/concepts-map/', '/texts/', ['/concepts'])).toBeUndefined()
  })
})
