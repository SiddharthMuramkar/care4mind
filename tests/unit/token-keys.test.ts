import { readdirSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { CONTRAST_PAIRS } from '@/lib/contrast'

const globals = readFileSync('src/styles/globals.css', 'utf8')
const topicSlugs = readdirSync('src/content/data/topics').map((name) => name.replace(/\.ts$/, ''))
const statusSource = readFileSync('src/content/schema/questionnaire.ts', 'utf8')
const statuses = (statusSource.match(/type QuestionnaireStatus = ([^\n]+)/)?.[1] ?? '')
  .split('|')
  .map((part) => part.trim().replace(/'/g, ''))

/** The contrast list names a status token by a short word, not by its slug. */
const statusToken: Record<string, string> = {
  live: 'live',
  preview: 'preview',
  'coming-soon': 'soon',
  'coming-later': 'later',
}

describe('topic hues', () => {
  it('finds the topic records', () => {
    expect(topicSlugs.length).toBeGreaterThan(0)
  })
  it.each(topicSlugs)(
    '%s has its colour token, its [data-topic] rule and a contrast pair',
    (slug) => {
      expect(globals).toContain(`--color-topic-${slug}:`)
      expect(globals).toContain(`[data-topic='${slug}']`)
      expect(CONTRAST_PAIRS.some((pair) => pair.foreground === `topic-${slug}`)).toBe(true)
    },
  )
})

describe('Questionnaire statuses', () => {
  it('finds the statuses', () => {
    expect(statuses.length).toBe(4)
  })
  it.each(statuses)('%s has its [data-status] rule and a contrast pair', (status) => {
    expect(globals).toContain(`[data-status='${status}']`)
    const token = statusToken[status]
    expect(token).toBeDefined()
    expect(globals).toContain(`--color-status-${token}:`)
    expect(CONTRAST_PAIRS.some((pair) => pair.foreground === `status-${token}-ink`)).toBe(true)
  })
})
