import { describe, expect, it } from 'vitest'

import { concepts } from '@/content'

// Front-end-site ticket 05: the in-text citation reader (`graph.ts`), read through the public
// interface. A citation is whatever sits in a pair of parentheses, even one whose author names
// its own parentheses, as Ahimsa's EPRA citation does.

describe('in-text citations', () => {
  it('reads a citation whose author holds parentheses of its own', async () => {
    const ahimsa = await concepts.get('ahimsa')
    expect(ahimsa?.citations).toMatchObject({
      '“EPRA International Journal of Multidisciplinary Research (IJMR),” 2019b': 'epra-2019',
    })
  })

  it('still reads the plain citations on the same page', async () => {
    const ahimsa = await concepts.get('ahimsa')
    expect(ahimsa?.citations).toMatchObject({
      'Tomar, 2024': 'tomar-2024',
      'Barai, 2018': 'barai-2018',
    })
  })

  it('reads nothing from parentheses that hold no citation', async () => {
    const ahimsa = await concepts.get('ahimsa')
    expect(Object.keys(ahimsa?.citations ?? {})).not.toContain('IJMR')
  })
})
