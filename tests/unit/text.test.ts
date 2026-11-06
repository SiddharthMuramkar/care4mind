import { describe, expect, it } from 'vitest'

import { wordList, listSeparator } from '@/lib/text'

describe('list joins', () => {
  it('joins one, two, three and many items as a sentence does', () => {
    expect(wordList([])).toBe('')
    expect(wordList(['a'])).toBe('a')
    expect(wordList(['a', 'b'])).toBe('a and b')
    expect(wordList(['a', 'b', 'c'])).toBe('a, b and c')
    expect(wordList(['a', 'b', 'c', 'd', 'e'])).toBe('a, b, c, d and e')
  })

  it('gives the separator before each item, for callers that join nodes', () => {
    expect([0, 1, 2, 3].map((index) => listSeparator(index, 4))).toEqual(['', ', ', ', ', ' and '])
    expect(listSeparator(0, 1)).toBe('')
    expect(listSeparator(1, 2)).toBe(' and ')
  })
})
