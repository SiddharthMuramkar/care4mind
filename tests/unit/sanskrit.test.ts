import { describe, expect, it } from 'vitest'

import {
  isNormalisedSanskrit,
  isSpeakerLine,
  normaliseSanskrit,
  openingLine,
  stripDiacritics,
} from '@/lib/sanskrit'

describe('normaliseSanskrit', () => {
  it('composes decomposed IAST into one character per letter', () => {
    const decomposed = 'vikṣepa' // s + combining dot below
    expect(decomposed).not.toBe('vikṣepa')
    expect(normaliseSanskrit(decomposed)).toBe('vikṣepa')
  })

  it('writes anusvara as ṃ, not ṁ, in both cases', () => {
    expect(normaliseSanskrit('Saṁśaya')).toBe('Saṃśaya')
    expect(normaliseSanskrit('ṀANTRA')).toBe('ṂANTRA')
  })

  it('also fixes ṁ typed as m plus a combining dot above', () => {
    expect(normaliseSanskrit('saṁsaya')).toBe('saṃsaya')
  })

  it('leaves Devanagari and plain text alone', () => {
    expect(normaliseSanskrit('विक्षेप')).toBe('विक्षेप')
    expect(normaliseSanskrit('Vikshepa (Distraction)')).toBe('Vikshepa (Distraction)')
  })
})

describe('stripDiacritics', () => {
  it('gives the plain-ASCII form NFR-03 asks for', () => {
    expect(stripDiacritics('vikṣepa')).toBe('viksepa')
    expect(stripDiacritics('Ṣaḍdarśana')).toBe('Saddarsana')
    expect(stripDiacritics('sthitaprajña')).toBe('sthitaprajna')
  })

  it('leaves Devanagari intact and still strips both anusvara dots', () => {
    expect(stripDiacritics('कर्म')).toBe('कर्म')
    expect(stripDiacritics('vikṣepa')).toBe('viksepa')
    expect(stripDiacritics('ṃ')).toBe('m')
    expect(stripDiacritics('ṁ')).toBe('m')
  })

  it('folds क्रम and कर्म apart, so मान is not found inside आत्मन्', () => {
    const fold = (text: string) => stripDiacritics(text.normalize('NFC')).toLowerCase()
    expect(fold('क्रम')).not.toBe(fold('कर्म'))
    expect(fold('आत्मन्').includes(fold('मान'))).toBe(false)
  })
})

describe('isNormalisedSanskrit', () => {
  it('flags text that still needs normalising', () => {
    expect(isNormalisedSanskrit('saṃśaya')).toBe(true)
    expect(isNormalisedSanskrit('saṁśaya')).toBe(false)
  })
})

describe('text helpers', async () => {
  const { capitalise, toDevanagariDigits } = await import('@/lib/text')

  it('capitalises IAST without losing marks', () => {
    expect(capitalise('ālasya')).toBe('Ālasya')
    expect(capitalise('ṛta')).toBe('Ṛta')
  })

  it('writes verse numbers in Devanagari digits', () => {
    expect(toDevanagariDigits('1.30')).toBe('१.३०')
    expect(toDevanagariDigits('5.211')).toBe('५.२११')
  })
})

describe('isSpeakerLine', () => {
  it('knows a speaker whose name stands apart from उवाच', () => {
    expect(isSpeakerLine('अर्जुन उवाच ।')).toBe(true)
    expect(isSpeakerLine('arjuna uvāca')).toBe(true)
  })

  it('knows a speaker joined to उवाच by sandhi, where उ becomes the vowel sign ु', () => {
    expect(isSpeakerLine('श्रीभगवानुवाच ।')).toBe(true)
    expect(isSpeakerLine('śrībhagavānuvāca')).toBe(true)
  })

  it('takes either danda after the speaker', () => {
    expect(isSpeakerLine('सञ्जय उवाच ॥')).toBe(true)
  })

  it('leaves a verse line alone', () => {
    expect(isSpeakerLine('प्रजहाति यदा कामान्सर्वान्पार्थ मनोगतान् ।')).toBe(false)
    expect(isSpeakerLine('prajahāti yadā kāmānsarvānpārtha manogatān')).toBe(false)
  })
})

describe('openingLine', () => {
  it('gives a verse’s first line after its speaker’s', () => {
    expect(
      openingLine([
        'श्रीभगवानुवाच ।',
        'प्रजहाति यदा कामान्सर्वान्पार्थ मनोगतान् ।',
        'आत्मन्येवात्मना तुष्टः स्थितप्रज्ञस्तदोच्यते',
      ]),
    ).toBe('प्रजहाति यदा कामान्सर्वान्पार्थ मनोगतान् ।')
    expect(
      openingLine([
        'अर्जुन उवाच ।',
        'स्थितप्रज्ञस्य का भाषा समाधिस्थस्य केशव ।',
        'स्थितधीः किं प्रभाषेत किमासीत व्रजेत किम्',
      ]),
    ).toBe('स्थितप्रज्ञस्य का भाषा समाधिस्थस्य केशव ।')
  })

  it('gives the first line of a verse with no speaker, and nothing for no lines', () => {
    expect(openingLine(['yogaś citta-vṛtti-nirodhaḥ'])).toBe('yogaś citta-vṛtti-nirodhaḥ')
    expect(openingLine([])).toBeUndefined()
  })
})
