import { describe, expect, it } from 'vitest'

import { titleMorphName } from '@/components/page-turn/PageTurn'
import { count, listed } from '@/lib/text'

describe('count', () => {
  it('takes the singular for one and the plural otherwise', () => {
    expect(count(1, 'entry', 'entries')).toBe('1 entry')
    expect(count(20, 'entry', 'entries')).toBe('20 entries')
    expect(count(0, 'Concept', 'Concepts')).toBe('0 Concepts')
  })
})

describe('listed', () => {
  it('joins names with commas and "and", without a serial comma', () => {
    expect(listed(['References', 'Courses', 'Text Books'])).toBe(
      'References, Courses and Text Books',
    )
    expect(listed(['References', 'Courses'])).toBe('References and Courses')
    expect(listed(['References'])).toBe('References')
  })
})

describe('titleMorphName', () => {
  it('names the title a card shares with its page, by kind and slug', () => {
    expect(titleMorphName('concept', 'alasya')).toBe('concept-title-alasya')
    expect(titleMorphName('questionnaire', 'gita-tool')).toBe('questionnaire-title-gita-tool')
    expect(titleMorphName('topic', 'mind')).toBe('topic-title-mind')
  })
})
