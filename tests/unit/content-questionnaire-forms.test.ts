import { describe, expect, it } from 'vitest'

import type { Features } from '@/config/features'
import type { QuestionnaireRecord } from '@/content/schema'
import { localSource } from '@/content/source'
import { createContent } from '@/content/views'

// Content-v1 ticket 06: the two instruments on the current site with real questions. The
// KarmaYoga Scale's 45 statements in the four parts its quiz settings give, ready for the preview
// flow, and the Dosha Survey's 12 questions, stored but never offered as a form.
//
// Two seams, both over the site's own records: the content source (what a record stores) and
// the public interface built on it with explicit flags (what the flow gets). Expected values
// come from the ticket, the spec and the quiz's settings as the extract tool prints them, never
// from the records themselves.

const ON: Features = {
  questionnairePreview: true,
  conceptMap: true,
  startHere: true,
}
const OFF: Features = { ...ON, questionnairePreview: false }

const FREQUENCY = ['Always', 'Often', 'Sometimes', 'Rarely', 'Never']
const AGREEMENT = [
  'Strongly Disagree',
  'Disagree',
  'Neither agree nor disagree',
  'Agree',
  'Strongly Agree',
]

/** The whole numbers from `first` to `last`, as the quiz's question ids. */
const ids = (first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_, i) => String(first + i))

/** Every string in a value. */
function stringsIn(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(stringsIn)
  if (value && typeof value === 'object') return Object.values(value).flatMap(stringsIn)
  return []
}

/** The stored Questionnaire record, read through the content source. */
async function stored(slug: string): Promise<QuestionnaireRecord> {
  const record = (await localSource.records('questionnaire')).find((q) => q.slug === slug)
  if (!record) throw new Error(`No Questionnaire record “${slug}”.`)
  return record
}

/** The form the public interface offers, with the preview flag as given. */
const offered = (slug: string, flags: Features) =>
  createContent(localSource, flags).questionnaires.form(slug)

describe('the KarmaYoga Scale’s form', () => {
  it('has the four parts its quiz settings give: 12, 6, 9 and 18 statements, titled by their steps', async () => {
    const { form } = await stored('karmayoga-scale')
    expect(form?.parts.map(({ title, items }) => [title, items.length])).toEqual([
      ['Everyday Experience - 1', 12],
      ['Everyday Experience - 2', 6],
      ['Experience Related to Work - 1', 9],
      ['Experience Related to Work - 2', 18],
    ])
  })

  it('keeps the order its settings give, not the page markup’s, each statement under its quiz id', async () => {
    const { form } = await stored('karmayoga-scale')
    expect(form?.parts.map(({ items }) => items.map(({ id }) => id))).toEqual([
      [...ids(15, 20), ...ids(23, 28)],
      ['57', '53', '54', '55', '56', '52'],
      ['21', '22', '13', '14', ...ids(29, 33)],
      ids(34, 51),
    ])
  })

  it('rates parts 1 and 3 by frequency (21 statements) and parts 2 and 4 by agreement (24)', async () => {
    const form = await offered('karmayoga-scale', ON)
    /** Which rating an item's options are, in either order. */
    const rating = (options: readonly string[]) => {
      const set = [...options].sort().join('|')
      if (set === [...FREQUENCY].sort().join('|')) return 'frequency'
      return set === [...AGREEMENT].sort().join('|') ? 'agreement' : 'other'
    }
    const ratingsByPart = form?.parts.map(({ items }) => [
      ...new Set(items.map(({ options }) => rating(options))),
    ])
    expect(ratingsByPart).toEqual([['frequency'], ['agreement'], ['frequency'], ['agreement']])
    const all = form?.parts.flatMap(({ items }) => items) ?? []
    expect(all.filter(({ options }) => rating(options) === 'frequency')).toHaveLength(21)
    expect(all.filter(({ options }) => rating(options) === 'agreement')).toHaveLength(24)
    for (const { options } of all.filter((item) => rating(item.options) === 'frequency'))
      expect(options).toEqual(FREQUENCY)
  })

  it('stores each option list once, in the order the quiz lists it', async () => {
    const { form } = await stored('karmayoga-scale')
    const lists = Object.values(form?.responseSets ?? {})
    expect(lists).toHaveLength(2)
    expect(lists).toEqual(expect.arrayContaining([FREQUENCY, AGREEMENT]))
  })

  it('marks exactly the nine agreement statements 34–42 reversed, shown from Strongly Agree as the quiz lists them', async () => {
    const { form } = await stored('karmayoga-scale')
    const reversed = form?.parts.flatMap(({ items }) => items.filter((item) => item.reversed))
    expect(reversed?.map(({ id }) => id)).toEqual(ids(34, 42))
    const shown = (await offered('karmayoga-scale', ON))?.parts.flatMap(({ items }) => items)
    const optionsOf = (id: string) => shown?.find((item) => item.id === id)?.options
    for (const id of ids(34, 42)) expect(optionsOf(id)).toEqual([...AGREEMENT].reverse())
    for (const id of ids(43, 57)) expect(optionsOf(id)).toEqual(AGREEMENT)
  })

  it('is offered with all 45 statements while the preview flag is on, and not at all while it is off', async () => {
    const form = await offered('karmayoga-scale', ON)
    expect(form?.parts.flatMap(({ items }) => items)).toHaveLength(45)
    expect(await offered('karmayoga-scale', OFF)).toBeNull()
  })
})

describe('the KarmaYoga Scale’s rights, scoring and held-back sections', () => {
  it('needs permission from the rights holders of Navare & Pandey (2022), noting Mulla & Krishnan (2014)', async () => {
    const { rights } = await stored('karmayoga-scale')
    expect(rights?.status).toBe('permission-needed')
    expect(rights?.holder).toContain('Navare & Pandey (2022)')
    expect(rights?.note).toContain('Mulla & Krishnan (2014)')
  })

  it('holds back the answer key, the result bands, the percentage result and the average-score line, each with where it was', async () => {
    const { heldBack } = await stored('karmayoga-scale')
    const described = (pattern: RegExp) => heldBack.filter(({ what }) => pattern.test(what))
    expect(heldBack).toHaveLength(4)
    expect(described(/answer key/i)).toHaveLength(1)
    expect(described(/three result bands/i)).toHaveLength(1)
    expect(described(/percentage/i)).toHaveLength(1)
    expect(described(/average score/i)).toHaveLength(1)
    expect(heldBack.filter(({ where }) => where.trim() === '')).toEqual([])
  })

  it('leaves scoring pending: the points were only in the current site’s database, and planning tickets 26 and 28 decide the rules', async () => {
    const { scoring } = await stored('karmayoga-scale')
    expect(scoring.status).toBe('pending')
    expect(scoring.reason).toMatch(/database/i)
    expect(scoring.reason).toMatch(/planning ticket 09\b/i)
    expect(scoring.reason).toMatch(/planning tickets 26 and 28\b/i)
  })
})

describe('the Dosha Survey', () => {
  it('is listed as coming later, and its questions are never offered, even while the preview flag is on', async () => {
    const content = createContent(localSource, ON)
    const card = (await content.questionnaires.list()).find(({ slug }) => slug === 'dosha-survey')
    expect(card).toMatchObject({ status: 'coming-later', href: '/questionnaires/#dosha-survey' })
    expect(await offered('dosha-survey', ON)).toBeNull()
    expect(await offered('dosha-survey', OFF)).toBeNull()
    const page = JSON.stringify(await content.questionnaires.get('dosha-survey'))
    const questions = (await stored('dosha-survey')).form?.parts.flatMap(({ items }) => items)
    expect(questions?.filter(({ text }) => page.includes(text))).toEqual([])
  })

  it('stores its 12 questions in one part, each with its own three options', async () => {
    const { form } = await stored('dosha-survey')
    expect(form?.parts).toHaveLength(1)
    const items = form?.parts[0]?.items ?? []
    expect(items).toHaveLength(12)
    expect(items.map(({ responseSet }) => form?.responseSets[responseSet]?.length)).toEqual(
      Array.from({ length: 12 }, () => 3),
    )
    expect(new Set(items.map(({ responseSet }) => responseSet)).size).toBe(12)
  })

  it('keeps each question with its topic label and odd spacing, leaving out the form’s numbers and required marks', async () => {
    const items = (await stored('dosha-survey')).form?.parts[0]?.items ?? []
    expect(items[0]?.text).toBe('(Memory) Which of the following best describes your memory?')
    expect(items[8]?.text).toMatch(/^\( First Reaction to Something New\) /)
    expect(items.filter(({ text }) => !text.startsWith('('))).toEqual([])
    expect(items.filter(({ text }) => /\bQuestion \d|\*/.test(text))).toEqual([])
  })

  it('stores nothing of the hidden anti-spam field the form plugin adds after question 9', async () => {
    const { form } = await stored('dosha-survey')
    expect(stringsIn(form).filter((text) => /learn to you/i.test(text))).toEqual([])
  })

  it('needs permission from a rights holder nobody has found', async () => {
    const { rights } = await stored('dosha-survey')
    expect(rights?.status).toBe('permission-needed')
    expect(rights?.holder).toMatch(/unknown/i)
  })

  it('leaves scoring pending: no rule exists on the current site or in any archive', async () => {
    const { scoring } = await stored('dosha-survey')
    expect(scoring.status).toBe('pending')
    expect(scoring.reason).toMatch(/planning tickets 09 and 10\b/i)
  })
})

describe('no trace of a result', () => {
  it('leaves every percentage figure out of both records, their notes and held-back lists included', async () => {
    for (const slug of ['karmayoga-scale', 'dosha-survey']) {
      const figures = stringsIn(await stored(slug)).filter((text) => /\d\s*%|%\s*\d/.test(text))
      expect(figures).toEqual([])
    }
  })
})
