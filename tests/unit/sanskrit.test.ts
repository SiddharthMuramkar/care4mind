import { describe, expect, it } from 'vitest'

import { isNormalisedSanskrit, normaliseSanskrit } from '@/content/schema'
import { stripDiacritics } from '@/lib/sanskrit'

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
