import { describe, expect, it } from 'vitest'

import { type Features, proposalsPageOn, readFeatures } from '@/config/features'

// Each flag, the variable that forces it, and the other flags, which an override must leave alone.
const FLAGS = [
  { flag: 'questionnairePreview', variable: 'FEATURE_QUESTIONNAIRE_PREVIEW' },
  { flag: 'conceptMap', variable: 'FEATURE_CONCEPT_MAP' },
  { flag: 'devanagariFirst', variable: 'FEATURE_DEVANAGARI_FIRST' },
] as const satisfies readonly { flag: keyof Features; variable: string }[]

// The three environments a build runs in, as Vercel names them in VERCEL_ENV.
const ENVIRONMENTS = [
  { name: 'a local run', env: {} },
  { name: 'a Vercel preview', env: { VERCEL_ENV: 'preview' } },
  { name: 'Vercel production', env: { VERCEL_ENV: 'production' } },
] as const

// What each flag is in each environment, with its variable unset, forced on (1) and forced off (0).
const EXPECTED = {
  'a local run': { unset: true, on: true, off: false },
  'a Vercel preview': { unset: true, on: true, off: false },
  'Vercel production': { unset: false, on: true, off: false },
} as const

describe('feature flags (D16, D20)', () => {
  for (const { flag, variable } of FLAGS) {
    describe(flag, () => {
      for (const { name, env } of ENVIRONMENTS) {
        const expected = EXPECTED[name]

        it(`is ${expected.unset ? 'on' : 'off'} in ${name}`, () => {
          expect(readFeatures(env)[flag]).toBe(expected.unset)
        })

        it(`is forced on by ${variable}=1 in ${name}`, () => {
          expect(readFeatures({ ...env, [variable]: '1' })[flag]).toBe(expected.on)
        })

        it(`is forced off by ${variable}=0 in ${name}`, () => {
          expect(readFeatures({ ...env, [variable]: '0' })[flag]).toBe(expected.off)
        })
      }

      it(`leaves the other flags alone when ${variable} forces it`, () => {
        const others = FLAGS.filter((other) => other.flag !== flag).map((other) => other.flag)
        for (const { env } of ENVIRONMENTS) {
          const plain = readFeatures(env)
          for (const value of ['0', '1']) {
            const forced = readFeatures({ ...env, [variable]: value })
            for (const other of others) expect(forced[other]).toBe(plain[other])
          }
        }
      })

      it(`treats an empty ${variable} as unset`, () => {
        expect(readFeatures({ VERCEL_ENV: 'production', [variable]: '' })[flag]).toBe(false)
        expect(readFeatures({ [variable]: '' })[flag]).toBe(true)
      })

      it(`refuses a ${variable} that is neither 1 nor 0, naming it`, () => {
        for (const value of ['true', 'on', 'yes', '2', ' 1']) {
          expect(() => readFeatures({ [variable]: value })).toThrow(variable)
        }
      })
    })
  }

  it('counts `vercel dev` (VERCEL_ENV=development) as a local run', () => {
    expect(readFeatures({ VERCEL_ENV: 'development' })).toEqual({
      questionnairePreview: true,
      conceptMap: true,
      devanagariFirst: true,
    })
  })

  it('switches every flag off together in production', () => {
    expect(readFeatures({ VERCEL_ENV: 'production' })).toEqual({
      questionnairePreview: false,
      conceptMap: false,
      devanagariFirst: false,
    })
  })

  it('shows the proposals page while either proposal is on, and the preview flag has no say', () => {
    const off = { questionnairePreview: false, conceptMap: false, devanagariFirst: false }
    expect(proposalsPageOn(off)).toBe(false)
    expect(proposalsPageOn({ ...off, questionnairePreview: true })).toBe(false)
    expect(proposalsPageOn({ ...off, conceptMap: true })).toBe(true)
    expect(proposalsPageOn({ ...off, devanagariFirst: true })).toBe(true)
  })
})
