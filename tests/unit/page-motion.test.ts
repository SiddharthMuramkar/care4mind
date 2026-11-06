import { globSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { TitleMorph, turnBack, turnForward, type TitleMorphKind } from '@/components/PageTurn'

/** The shared name a title flies under, read off the element TitleMorph makes. */
function morphName(kind: TitleMorphKind, slug: string): string | undefined {
  const element = TitleMorph({ kind, slug, children: 'A title' })
  return (element.props as { name?: string }).name
}

describe('the page turns', () => {
  it('name the two directions a link can turn the page', () => {
    expect(turnForward).toEqual(['turn-forward'])
    expect(turnBack).toEqual(['turn-back'])
  })
})

describe('TitleMorph', () => {
  it('spells the shared name each kind of title flies under', () => {
    expect(morphName('concept', 'vikshepa')).toBe('concept-title-vikshepa')
    expect(morphName('questionnaire', 'karmayoga-scale')).toBe(
      'questionnaire-title-karmayoga-scale',
    )
    expect(morphName('topic', 'mind-states')).toBe('topic-title-mind-states')
    expect(morphName('work', 'yoga-sutra')).toBe('work-title-yoga-sutra')
  })

  it('gives the two ends of one flight the same name, and other flights other names', () => {
    // A morph pairs its two ends by name alone, so the name must be a pure
    // function of the kind and slug, and must tell other titles apart.
    expect(morphName('concept', 'vikshepa')).toBe(morphName('concept', 'vikshepa'))
    expect(morphName('concept', 'vikshepa')).not.toBe(morphName('topic', 'vikshepa'))
    expect(morphName('concept', 'vikshepa')).not.toBe(morphName('concept', 'citta'))
  })

  it('morphs its child, and nothing else moves with it', () => {
    const element = TitleMorph({ kind: 'concept', slug: 'vikshepa', children: 'A title' })
    expect(element.props).toMatchObject({ share: 'morph', default: 'none', children: 'A title' })
  })

  it("is the one place a flying title's name is spelled", () => {
    const spelled = globSync('src/**/*.{ts,tsx}').filter((file) =>
      /-title-\$\{/.test(readFileSync(file, 'utf8')),
    )
    expect(spelled).toEqual(['src/components/PageTurn/PageTurn.tsx'])
  })
})
