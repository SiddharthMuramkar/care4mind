import { describe, expect, it } from 'vitest'

import type { Features } from '@/config/features'
import { proposalsFor } from '@/components/proposals/proposals'

import { ON } from './flags'

// Front-end-site ticket 12: what /proposals/ lists for the Project owner's sign-off (D20). The
// built proposal shows only while its flag is on; audio pronunciation is described, not
// built; the reading-path idea was dropped with D21. Expected names come from the ticket.

const listed = (flags: Features) => proposalsFor(flags).map(({ name, built }) => ({ name, built }))

describe('proposalsFor', () => {
  it('lists the map and audio pronunciation, and nothing else', () => {
    expect(listed(ON)).toEqual([
      { name: 'Concept map', built: true },
      { name: 'Start here', built: true },
      { name: 'Audio pronunciation', built: false },
    ])
  })

  it('leaves out a built proposal whose flag is off', () => {
    expect(listed({ ...ON, conceptMap: false })).toEqual([
      { name: 'Start here', built: true },
      { name: 'Audio pronunciation', built: false },
    ])
    expect(listed({ ...ON, startHere: false })).toEqual([
      { name: 'Concept map', built: true },
      { name: 'Audio pronunciation', built: false },
    ])
  })

  it('says for each what it adds, what it costs in speed and upkeep, and how it is switched off', () => {
    for (const proposal of proposalsFor(ON)) {
      expect(proposal.adds, proposal.name).toMatch(/\w{3}/)
      expect(proposal.speed, proposal.name).toMatch(/\w{3}/)
      expect(proposal.upkeep, proposal.name).toMatch(/\w{3}/)
      expect(proposal.off, proposal.name).toMatch(/\w{3}/)
    }
    const text = JSON.stringify(proposalsFor(ON)).toLowerCase()
    expect(text).not.toMatch(/reading path/)
  })
})
