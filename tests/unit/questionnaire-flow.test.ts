import { beforeAll, describe, expect, it } from 'vitest'

import type { Features } from '@/config/features'
import type { QuestionnaireFormView } from '@/content'
import { localSource, type ContentSource } from '@/content/source'
import { createContent } from '@/content/views'
import {
  addressOf,
  entryAt,
  flowReducer,
  placeOf,
  progressOf,
  progressText,
  startFlow,
  stepFromAddress,
  unsaved,
  type FlowAction,
  type FlowState,
} from '@/lib/questionnaire/flow'
import { scoreQuestionnaire } from '@/lib/questionnaire/score'
import { statusWords } from '@/components/StatusBadge'

// Front-end-site ticket 10: the KarmaYoga flow's state, kept only in a reducer (D16), and the
// Questionnaire gate. Two seams: the pure flow module (what each press does to the flow) and the
// public content interface built with explicit flags (whether the flow exists at all). Expected
// values come from the ticket and the spec: four parts of 12, 6, 9 and 18 statements, 45 in all.

const ON: Features = { questionnairePreview: true, conceptMap: true, devanagariFirst: true }
const OFF: Features = { ...ON, questionnairePreview: false }

let form: QuestionnaireFormView

beforeAll(async () => {
  const offered = await createContent(localSource, ON).questionnaires.form('karmayoga-scale')
  if (!offered) throw new Error('The KarmaYoga Scale has no form with the preview flag on.')
  form = offered
})

/** The item at `index` (from the end when negative); a missing one fails the test. */
function nth<T>(list: readonly T[], index: number): T {
  const item = list.at(index)
  if (item === undefined) throw new Error(`Nothing at ${index} of ${list.length}.`)
  return item
}

/** A part's statements (parts from 1). */
const itemsOf = (part: number) => nth(form.parts, part - 1).items

/** Run presses in order from the start of the flow. */
const play = (...actions: FlowAction[]): FlowState => actions.reduce(flowReducer, startFlow(form))

/** Answer every statement of a part (1-based) with each statement's first option. */
const answerPart = (part: number): FlowAction[] =>
  itemsOf(part).map((item) => ({
    type: 'answer',
    item: item.id,
    option: nth(item.options, 0),
  }))

/** Answer every part up to and including `last`, pressing Next after each. */
const through = (last: number): FlowAction[] =>
  Array.from({ length: last }, (_, i) => [...answerPart(i + 1), { type: 'next' } as const]).flat()

describe('the flow', () => {
  it('starts a statement whose id is constructor unanswered', () => {
    const madeUp = {
      parts: [
        {
          id: 'only',
          title: 'Only',
          instructions: 'Answer.',
          items: [{ id: 'constructor', text: 'A statement.', options: ['Yes', 'No'] }],
        },
      ],
    }
    const state = startFlow(madeUp)
    expect(progressOf(state).answered).toBe(0)
    expect(progressText(progressOf(state))).toBe('Part 1 of 1 · 0 of 1 answered')
    expect(flowReducer(state, { type: 'next' }).missing).toEqual(['constructor'])
    const given = flowReducer(state, { type: 'answer', item: 'constructor', option: 'Yes' })
    expect(progressOf(given).answered).toBe(1)
    expect(scoreQuestionnaire(madeUp, {})).toEqual({ status: 'incomplete' })
    expect(scoreQuestionnaire(madeUp, { constructor: 'Yes' })).toEqual({ status: 'pending' })
  })

  it('starts on part 1 with nothing answered', () => {
    const state = startFlow(form)
    expect(state.step).toBe('part-1')
    expect(state.answers).toEqual({})
    expect(progressText(progressOf(state))).toBe('Part 1 of 4 · 0 of 45 answered')
  })

  it('counts each statement answered, once however often it changes', () => {
    const [first, second] = [nth(itemsOf(1), 0), nth(itemsOf(1), 1)]
    const state = play(
      { type: 'answer', item: first.id, option: 'Always' },
      { type: 'answer', item: first.id, option: 'Never' },
      { type: 'answer', item: second.id, option: 'Often' },
    )
    expect(state.answers).toEqual({ [first.id]: 'Never', [second.id]: 'Often' })
    expect(state.step).toBe('part-1')
    expect(progressText(progressOf(state))).toBe('Part 1 of 4 · 2 of 45 answered')
  })

  it('refuses Next on an unfinished part, naming each statement left, and keeps every answer', () => {
    const items = itemsOf(1)
    const given = answerPart(1).slice(0, 9)
    const state = play(...given, { type: 'next' })
    expect(state.step).toBe('part-1')
    expect(state.missing).toEqual(items.slice(9).map(({ id }) => id))
    expect(Object.keys(state.answers)).toHaveLength(9)
    expect(state.refusals).toBe(1)
  })

  it('counts each refusal, so the summary can take focus again', () => {
    expect(play({ type: 'next' }, { type: 'next' }).refusals).toBe(2)
  })

  it('drops a statement from the missing ones once it is answered', () => {
    const [first, ...rest] = [nth(itemsOf(1), 0), ...itemsOf(1).slice(1)]
    const state = play({ type: 'next' }, { type: 'answer', item: first.id, option: 'Rarely' })
    expect(state.missing).toEqual(rest.map(({ id }) => id))
  })

  it('moves through the four parts of 12, 6, 9 and 18 statements, then to review', () => {
    expect(form.parts.map(({ items }) => items.length)).toEqual([12, 6, 9, 18])
    expect(play(...through(1)).step).toBe('part-2')
    expect(progressText(progressOf(play(...through(1))))).toBe('Part 2 of 4 · 12 of 45 answered')
    expect(play(...through(3)).step).toBe('part-4')
    const review = play(...through(4))
    expect(review.step).toBe('review')
    expect(review.missing).toEqual([])
    expect(progressText(progressOf(review))).toBe('Review · 45 of 45 answered')
  })

  it('finishes from review to the end screen', () => {
    expect(play(...through(4), { type: 'next' }).step).toBe('end')
  })

  it('goes back a part with every answer kept, and no further than part 1', () => {
    const state = play(...through(2), ...answerPart(3).slice(0, 4), { type: 'back' })
    expect(state.step).toBe('part-2')
    expect(Object.keys(state.answers)).toHaveLength(12 + 6 + 4)
    expect(play({ type: 'back' }).step).toBe('part-1')
    expect(play(...through(4), { type: 'back' }).step).toBe('part-4')
    expect(play(...through(4), { type: 'next' }, { type: 'back' }).step).toBe('review')
  })

  it('clears a refusal when the part changes', () => {
    const state = play(...through(1), { type: 'next' }, { type: 'back' })
    expect(state.step).toBe('part-1')
    expect(state.missing).toEqual([])
  })

  it('goes to any step already open, as browser Back, Forward and Change do', () => {
    const done = play(...through(4))
    expect(flowReducer(done, { type: 'go', step: 'part-2' }).step).toBe('part-2')
    expect(flowReducer(done, { type: 'go', step: 'end' }).step).toBe('end')
    const second = play(...through(1))
    expect(flowReducer(second, { type: 'go', step: 'part-1' }).step).toBe('part-1')
  })

  it('never opens a step past the first unfinished part', () => {
    expect(play({ type: 'go', step: 'part-3' }).step).toBe('part-1')
    expect(play({ type: 'go', step: 'end' }).step).toBe('part-1')
    expect(play(...through(2), { type: 'go', step: 'review' }).step).toBe('part-3')
    expect(play({ type: 'go', step: 'part-9' as 'part-1' }).step).toBe('part-1')
  })

  it('clears every answer on Retake and returns to part 1', () => {
    const state = play(...through(4), { type: 'next' }, { type: 'retake' })
    expect(state.step).toBe('part-1')
    expect(state.answers).toEqual({})
    expect(state.missing).toEqual([])
  })

  it('warns before leaving while answers are given and the end screen is not reached', () => {
    expect(unsaved(startFlow(form))).toBe(false)
    expect(unsaved(play(...answerPart(1).slice(0, 1)))).toBe(true)
    expect(unsaved(play(...through(4)))).toBe(true)
    expect(unsaved(play(...through(4), { type: 'next' }))).toBe(false)
    expect(unsaved(play(...through(4), { type: 'next' }, { type: 'retake' }))).toBe(false)
  })
})

describe('the address', () => {
  it('names the step and nothing else', () => {
    expect(addressOf('part-2')).toBe('?step=part-2')
    expect(addressOf('review')).toBe('?step=review')
    expect(addressOf('end')).toBe('?step=end')
  })

  it('reads the step back, and part 1 from anything else', () => {
    expect(stepFromAddress('?step=part-3')).toBe('part-3')
    expect(stepFromAddress('?step=review')).toBe('review')
    expect(stepFromAddress('?step=end')).toBe('end')
    expect(stepFromAddress('')).toBe('part-1')
    expect(stepFromAddress('?step=part-0')).toBe('part-1')
    expect(stepFromAddress('?step=elsewhere')).toBe('part-1')
  })

  it('numbers its history entries, so a traversal tells Back from Forward', () => {
    expect(placeOf(entryAt(0))).toBe(0)
    expect(placeOf(entryAt(3))).toBe(3)
    expect(placeOf({ ...entryAt(2), __NA: true })).toBe(2)
  })

  it('reads no place from an entry that is not the flow’s', () => {
    expect(placeOf(null)).toBeNull()
    expect(placeOf({ __NA: true })).toBeNull()
    expect(placeOf({ flowPlace: 'two' })).toBeNull()
  })

  it('never carries an answer', () => {
    const state = play(...through(4))
    for (const step of ['part-1', 'part-2', 'part-3', 'part-4', 'review', 'end'] as const) {
      const address = addressOf(flowReducer(state, { type: 'go', step }).step)
      for (const answer of Object.values(state.answers)) expect(address).not.toContain(answer)
    }
  })
})

describe('the scoring stub', () => {
  /** A complete answer set, each statement's option picked by its position in the part. */
  const answered = (pick: (options: readonly string[], position: number) => string) =>
    Object.fromEntries(
      form.parts.flatMap(({ items }) =>
        items.map((item, position) => [item.id, pick(item.options, position)]),
      ),
    )

  it('leaves every complete answer set pending until the scoring rules are confirmed', () => {
    const first = answered((options) => nth(options, 0))
    const last = answered((options) => nth(options, -1))
    const mixed = answered((options, position) => nth(options, position % options.length))
    expect(Object.keys(first)).toHaveLength(45)
    for (const answers of [first, last, mixed]) {
      expect(scoreQuestionnaire(form, answers)).toEqual({ status: 'pending' })
    }
  })

  it('says an answer set with a statement left is incomplete', () => {
    const [, ...rest] = Object.entries(answered((options) => nth(options, 0)))
    expect(scoreQuestionnaire(form, Object.fromEntries(rest))).toEqual({ status: 'incomplete' })
    expect(scoreQuestionnaire(form, {})).toEqual({ status: 'incomplete' })
  })
})

describe('the gate (D16)', () => {
  const FLOW = '/questionnaires/karmayoga-scale/take/'

  /** The site's own records, with the KarmaYoga Scale's status set to `live`. */
  const liveSource: ContentSource = {
    async records(kind) {
      const records = await localSource.records(kind)
      if (kind !== 'questionnaire') return records
      return records.map((record) =>
        'slug' in record && record.slug === 'karmayoga-scale'
          ? { ...record, status: 'live' }
          : record,
      ) as typeof records
    },
  }

  /**
   * Whether the flow is a route, where Start leads and the status a visitor sees, for these flags,
   * on the Questionnaire's page, its card on the list and its card on its Concept's page.
   */
  async function gate(flags: Features, source: ContentSource = localSource) {
    const { questionnaires, concepts, site } = createContent(source, flags)
    const questionnaire = await questionnaires.get('karmayoga-scale')
    if (!questionnaire) throw new Error('No KarmaYoga Scale.')
    const card = (await questionnaires.list()).find(({ slug }) => slug === 'karmayoga-scale')
    const linked = (await concepts.get('vikshepa'))?.linked.questionnaires.find(
      ({ slug }) => slug === 'karmayoga-scale',
    )
    const paths = (await site.routes()).map(({ path }) => path)
    const seen = ({ shownStatus, takeHref }: { shownStatus: string; takeHref?: string }) => ({
      shownStatus,
      takeHref,
    })
    expect(card && seen(card)).toEqual(seen(questionnaire))
    expect(linked && seen(linked)).toEqual(seen(questionnaire))
    return {
      routed: paths.includes(FLOW),
      form: (await questionnaires.form('karmayoga-scale')) !== null,
      ...seen(questionnaire),
    }
  }

  it('opens the preview flow while questionnairePreview is on, and Start links to it', async () => {
    expect(await gate(ON)).toEqual({
      routed: true,
      form: true,
      shownStatus: 'preview',
      takeHref: FLOW,
    })
  })

  it('has no flow while the flag is off, and Start is disabled: coming soon', async () => {
    expect(await gate(OFF)).toEqual({
      routed: false,
      form: false,
      shownStatus: 'coming-soon',
      takeHref: undefined,
    })
  })

  it('opens a live Questionnaire whatever the flag', async () => {
    for (const flags of [ON, OFF]) {
      expect(await gate(flags, liveSource)).toEqual({
        routed: true,
        form: true,
        shownStatus: 'live',
        takeHref: FLOW,
      })
    }
  })

  it('names every status in words', () => {
    expect(statusWords('live')).toBe('Open')
    expect(statusWords('preview')).toBe('Preview')
    expect(statusWords('coming-soon')).toBe('Coming soon')
    expect(statusWords('coming-later')).toBe('Coming later')
  })
})
