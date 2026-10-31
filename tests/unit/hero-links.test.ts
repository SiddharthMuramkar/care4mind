import { describe, expect, it } from 'vitest'

import { home } from '@/content'
import { heroLinks } from '@/lib/hero-links'

describe('the opening folio’s links', () => {
  it('lead to Start here, then Browse concepts, while Start here is on', async () => {
    const { hero } = await home.get()
    expect(heroLinks(hero, true)).toEqual([
      { label: 'Start here', href: '/start/' },
      { label: 'Browse concepts', href: '/concepts/' },
    ])
  })

  it('are one Explore concepts link to /concepts/ while it is off', async () => {
    const { hero } = await home.get()
    expect(heroLinks(hero, false)).toEqual([{ label: 'Explore concepts', href: '/concepts/' }])
  })
})
