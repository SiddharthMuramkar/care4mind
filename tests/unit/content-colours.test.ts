import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { type QuestionnaireStatus, topics } from '@/content'
import { CONTRAST_PAIRS, customProperties } from '@/styles/contrast'

const css = readFileSync('src/styles/globals.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const declarations = customProperties(css)

/** The custom properties a `[data-<attribute>='<value>']` rule declares, or undefined without one. */
function ruleFor(attribute: string, value: string): Record<string, string> | undefined {
  const rule = new RegExp(`\\[data-${attribute}='${value}'\\]\\s*\\{([^{}]*)\\}`).exec(css)
  return rule ? customProperties(rule[1] ?? '') : undefined
}

function hasPair(foreground: string, background: string): boolean {
  return CONTRAST_PAIRS.some(
    (pair) => pair.foreground === foreground && pair.background === background,
  )
}

// A Record over the type, so a new status fails the type check until it names its badge token.
const STATUS_TOKENS: Record<QuestionnaireStatus, string> = {
  live: 'status-live',
  preview: 'status-preview',
  'coming-soon': 'status-soon',
  'coming-later': 'status-later',
}

describe('every topic has its colour', async () => {
  const slugs = (await topics.list()).map(({ slug }) => slug)

  it('finds the topics', () => {
    expect(slugs).not.toEqual([])
  })

  for (const slug of slugs) {
    const token = `topic-${slug}`

    it(`${slug}: a token, a [data-topic] rule and contrast pairs`, () => {
      expect(declarations, `--color-${token}`).toHaveProperty([`--color-${token}`])
      expect(ruleFor('topic', slug)?.['--topic']).toBe(`var(--color-${token})`)
      for (const background of ['ground', 'surface', 'panel', 'drawer'])
        expect(hasPair(token, background), `${token} on ${background}`).toBe(true)
    })
  }
})

describe('every Questionnaire status has its badge colours', () => {
  for (const [status, token] of Object.entries(STATUS_TOKENS)) {
    it(`${status}: tokens, a [data-status] rule and a contrast pair`, () => {
      expect(declarations).toHaveProperty([`--color-${token}`])
      expect(declarations).toHaveProperty([`--color-${token}-ink`])
      const rule = ruleFor('status', status)
      expect(rule?.['--status']).toBe(`var(--color-${token})`)
      expect(rule?.['--status-ink']).toBe(`var(--color-${token}-ink)`)
      expect(hasPair(`${token}-ink`, token)).toBe(true)
    })
  }
})
