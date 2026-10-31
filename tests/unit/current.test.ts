import { describe, expect, it } from 'vitest'

import { currentFor } from '@/components/nav/current'

// Which header link is current. The browser suite checks six real paths; these pin the rule
// a prefix match can get wrong.

describe('currentFor', () => {
  it('is page on the link’s own address', () => {
    expect(currentFor('/concepts/', '/concepts/')).toBe('page')
  })

  it('treats a pathname without its slash as that same page', () => {
    expect(currentFor('/concepts', '/concepts/')).toBe('page')
  })

  it('is true inside a section, and not on a sibling that only begins with its name', () => {
    expect(currentFor('/concepts/vikshepa/', '/concepts/', ['/concepts/'])).toBe('true')
    // /concepts/ is a prefix of /concepts/map/, not of /concepts-map/. Drop the slash and it is.
    expect(currentFor('/concepts-map/', '/concepts/', ['/concepts/'])).toBeUndefined()
  })
})
