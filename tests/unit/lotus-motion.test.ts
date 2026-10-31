import { runInNewContext } from 'node:vm'

import { describe, expect, it } from 'vitest'

import { LotusHeadScript } from '@/components/LotusHeadScript'
import { lotusMotionFrom } from '@/components/lotus-motion'

describe('lotusMotionFrom', () => {
  it('keeps the lotuses still once a pause is stored', () => {
    expect(lotusMotionFrom('still')).toBe('still')
  })

  it('sets them breathing when nothing is stored, or anything else is', () => {
    for (const stored of [null, '', 'breathing', 'Still', ' still', 'true']) {
      expect(lotusMotionFrom(stored), JSON.stringify(stored)).toBe('breathing')
    }
  })
})

/**
 * Runs the head script on its own, as the browser does before the first paint, with this
 * localStorage, and returns the motion it marks <html> with.
 */
function motionMarkedBy(localStorage: () => Pick<Storage, 'getItem'>) {
  const dataset: { lotusMotion?: string } = {}
  const sandbox = { document: { documentElement: { dataset } } }
  Object.defineProperty(sandbox, 'localStorage', { get: localStorage })
  runInNewContext(LotusHeadScript().props.dangerouslySetInnerHTML.__html, sandbox)
  return dataset.lotusMotion
}

const storing = (entries: Record<string, string>) => () => ({
  getItem: (key: string) => entries[key] ?? null,
})

describe('the lotus head script', () => {
  it('marks <html> still from a stored pause, and breathing without one', () => {
    expect(motionMarkedBy(storing({ 'care4mind:lotus-motion': 'still' }))).toBe('still')
    expect(motionMarkedBy(storing({}))).toBe('breathing')
  })

  it('marks <html> breathing when storage is blocked and throws', () => {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError')
    }
    expect(motionMarkedBy(blocked)).toBe('breathing')
  })
})
