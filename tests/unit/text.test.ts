import { describe, expect, it } from 'vitest'

import gita254 from '@/content/data/passages/bhagavad-gita/2.54'
import gita255 from '@/content/data/passages/bhagavad-gita/2.55'
import { isSpeakerLine } from '@/lib/text'

describe('isSpeakerLine', () => {
  it('recognises a speaker said with उ or the sandhi vowel sign, and a line that is not one', () => {
    expect(isSpeakerLine('श्रीभगवानुवाच ।')).toBe(true)
    expect(isSpeakerLine('अर्जुन उवाच ।')).toBe(true)
    expect(isSpeakerLine('śrībhagavānuvāca')).toBe(true)
    expect(isSpeakerLine('प्रजहाति यदा कामान्सर्वान्पार्थ मनोगतान् ।')).toBe(false)
  })

  it('takes 2.54 and 2.55’s speaker off the verse, in Devanagari and in IAST', () => {
    for (const passage of [gita254, gita255]) {
      const iast = passage.transliteration
      if (!iast) throw new Error(`${passage.id} has a transliteration.`)
      expect(isSpeakerLine(passage.devanagari[0] ?? '')).toBe(true)
      expect(passage.devanagari.find((line) => !isSpeakerLine(line))).toBe(passage.devanagari[1])
      expect(isSpeakerLine(iast.lines[0] ?? '')).toBe(true)
      expect(iast.lines.find((line) => !isSpeakerLine(line))).toBe(iast.lines[1])
    }
  })
})
