import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { ESLint } from 'eslint'
import sharp from 'sharp'
import { beforeAll, describe, expect, it } from 'vitest'

import { art, artFor, ownArt, type ArtOrigin, type ArtRecord } from '@/art'
import {
  conceptArt,
  heroPlates,
  questionnaireArt,
  sectionArt,
  topicArt,
  workArt,
  type PictureId,
  type SectionKey,
} from '@/art/assign'
import { EMBLEM_MARK, EMBLEM_RING } from '@/art/emblem'
import { ART } from '@/art/registry'
import { createArt } from '@/art/resolve'
import { SLOTS, type SlotId } from '@/art/slots'
import { concepts, questionnaires, topics, works } from '@/content'

import { flagsOff, flagsOn } from '../flags'

const PUBLIC = join(process.cwd(), 'public')
const LICENCE = "The client's own picture; reuse confirmation pending"
const MAX_BYTES = 1_500_000

interface Original {
  verdict: string
  newId: string
  newSrc: string
  wpId: number
}

const { files } = JSON.parse(
  readFileSync(join(process.cwd(), 'scripts/art/originals.json'), 'utf8'),
) as { files: Original[] }
const KEPT = files.filter((file) => file.verdict === 'KEEP')

/** Whether an origin says everything its kind has to. */
function isComplete(origin: ArtOrigin): boolean {
  switch (origin.kind) {
    case 'care4mind':
      return origin.wpId > 0 && origin.oldPath.startsWith('/wp-content/uploads/')
    case 'generated':
      return [origin.tool, origin.model, origin.prompt, origin.made].every(Boolean)
    case 'licensed':
      return [origin.credit, origin.source].every(Boolean)
  }
}

describe('art', () => {
  it('returns the record of a picture, with the pixels of its file', () => {
    expect(art('plate-jeweller')).toMatchObject({
      family: 'plate',
      src: '/art/plates/jeweller.jpg',
      width: 1024,
      height: 1024,
      caption: 'The jeweller',
      origin: {
        kind: 'care4mind',
        wpId: 464,
        oldPath: '/wp-content/uploads/2024/05/Jewellry-making-2.jpeg',
      },
    })
  })
})

describe('the Emblem records', { timeout: 30_000 }, () => {
  const eslint = new ESLint({ cwd: process.cwd() })

  /** What the lint rule on the Emblem file reports for `code` placed in that file. */
  async function problems(code: string) {
    const [result] = await eslint.lintText(code, { filePath: 'src/art/emblem.ts' })
    return (result?.messages ?? []).filter((m) => m.ruleId === 'no-restricted-syntax')
  }

  it('are the registry’s own', () => {
    expect(art('emblem-ring')).toBe(EMBLEM_RING)
    expect(art('emblem-mark')).toBe(EMBLEM_MARK)
  })

  // Error pages are client components, so anything `emblem.ts` brings in reaches the browser.
  it.each([
    "import { art } from './index'\nexport const a = art\n",
    "import './index'\n",
    "export { art } from './index'\n",
    "export * from './index'\n",
    "export const a = () => import('./index')\n",
  ])('stop their file bringing in a value: %s', async (code) => {
    expect(await problems(code)).toHaveLength(1)
  })

  it('let their file bring in types', async () => {
    const code =
      "import type { ArtRecord } from './types'\nexport type { ArtFamily } from './types'\nexport type R = ArtRecord\n"
    expect(await problems(code)).toEqual([])
  })
})

describe('the art registry', () => {
  it('holds the 22 kept pictures', () => {
    expect(ART).toHaveLength(22)
  })

  it('has a unique kebab-case id for every picture', () => {
    const ids = ART.map((record) => record.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })

  it('has a record, with its address and old id, for every picture kept from the old site', () => {
    expect(KEPT).toHaveLength(22)
    for (const kept of KEPT) {
      const record = ART.find((candidate) => candidate.id === kept.newId)
      expect(record?.src, kept.newId).toBe(kept.newSrc)
      expect(record?.origin.wpId, kept.newId).toBe(kept.wpId)
      expect(record?.approved, kept.newId).toBe(true)
      expect(record?.licence, kept.newId).toBe(LICENCE)
    }
  })

  it('has no file under public/art without a record', () => {
    const onDisk = readdirSync(join(PUBLIC, 'art'), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
      .map((entry) => join(entry.parentPath, entry.name).slice(PUBLIC.length))
      .sort()
    expect(onDisk).toEqual(ART.map((record) => record.src).sort())
  })

  describe.each(ART)('$id', (record) => {
    it('has a file under the size limit', () => {
      const path = join(PUBLIC, record.src)
      expect(existsSync(path)).toBe(true)
      expect(statSync(path).size).toBeLessThan(MAX_BYTES)
    })

    it('states the true pixels of its file', async () => {
      // autoOrient: the size after any EXIF rotation, so a rotated file cannot pass with its sides swapped.
      const { autoOrient } = await sharp(join(PUBLIC, record.src)).metadata()
      expect(autoOrient).toEqual({ width: record.width, height: record.height })
    })

    it('has alt text of at most 125 characters', () => {
      expect(record.alt).not.toBe('')
      expect(record.alt.length).toBeLessThanOrEqual(125)
    })

    it('has a complete origin and a licence', () => {
      expect(isComplete(record.origin)).toBe(true)
      expect(record.licence).not.toBe('')
    })
  })
})

describe('the slots', () => {
  it('name the 32 new pictures, 12 of them Stickers and 20 Plates', () => {
    expect(SLOTS).toHaveLength(32)
    expect(SLOTS.filter((slot) => slot.family === 'sticker')).toHaveLength(12)
    expect(SLOTS.filter((slot) => slot.family === 'plate')).toHaveLength(20)
  })

  it('give every picture a unique kebab-case id and a placement', () => {
    const ids = SLOTS.map((slot) => slot.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const slot of SLOTS) {
      expect(slot.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(slot.placement, slot.id).not.toBe('')
    }
  })

  it('use the words Plate and Pothi, never Medallion or cover', () => {
    for (const { id, family } of SLOTS) {
      expect(id).toMatch(/^(?:sticker|pothi|plate)-/)
      expect(family, id).toBe(id.startsWith('plate-') ? 'plate' : 'sticker')
    }
  })

  it('leave out the Dosha Survey’s Plate, which waits until the Survey has a page', () => {
    expect(SLOTS.map((slot) => slot.id)).not.toContain('plate-dosha-survey')
  })

  it('give a record under a slot’s id the slot’s family', () => {
    for (const record of ART) {
      const slot = SLOTS.find((candidate) => candidate.id === (record.id as string))
      if (slot) expect(record.family, record.id).toBe(slot.family)
    }
  })

  it('make a mistyped slot id fail the typecheck', () => {
    // @ts-expect-error a slot id that does not exist
    const typo: SlotId = 'plate-ahimsaa'
    expect(SLOTS.map((slot) => slot.id)).not.toContain(typo)
  })
})

describe('the placements', () => {
  let conceptSlugs: string[] = []
  let workSlugs: string[] = []
  let topicSlugs: string[] = []
  let questionnaireSlugs: string[] = []

  // Read once, with room for a busy machine: the content is built from all of its files.
  beforeAll(async () => {
    const [conceptList, workList, topicList, questionnaireList] = await Promise.all([
      concepts.list(),
      works.list(),
      topics.list(),
      questionnaires.list(),
    ])
    conceptSlugs = conceptList.map((card) => card.slug).sort()
    workSlugs = workList.map((card) => card.slug).sort()
    topicSlugs = topicList.map((card) => card.slug).sort()
    questionnaireSlugs = questionnaireList.map((card) => card.slug).sort()
  }, 60_000)

  /** Every id the assignment tables name, Interim pictures included. */
  function named(): string[] {
    return [
      ...Object.values(sectionArt).flatMap(({ art, interim }) => [art, interim]),
      ...Object.values(topicArt).flatMap(({ sticker, interim, frontispiece }) => [
        sticker,
        interim,
        frontispiece,
      ]),
      ...Object.values(conceptArt),
      ...Object.values(workArt),
      ...Object.values(questionnaireArt),
      ...heroPlates,
    ].filter((id) => id !== undefined)
  }

  it('name only pictures that are in the registry or the slots', () => {
    const known = new Set<string>([...ART.map(({ id }) => id), ...SLOTS.map(({ id }) => id)])
    expect(named().filter((id) => !known.has(id))).toEqual([])
  })

  it('name every slot, so no new picture is made for nowhere', () => {
    const used = new Set(named())
    expect(SLOTS.map(({ id }) => id).filter((id) => !used.has(id))).toEqual([])
  })

  it('cover exactly the site’s Concepts, Traditional texts and topics', () => {
    expect(Object.keys(conceptArt).sort()).toEqual(conceptSlugs)
    expect(Object.keys(workArt).sort()).toEqual(workSlugs)
    expect(Object.keys(topicArt).sort()).toEqual(topicSlugs)
  })

  it('give a Questionnaire a picture of its own only where one was made for it', () => {
    expect(questionnaireArt).toEqual({ 'karmayoga-scale': 'plate-karma-yoga' })
    expect(questionnaireSlugs).toContain('karmayoga-scale')
  })

  it('leave the proposals page without a picture and give the others one', () => {
    expect(Object.keys(sectionArt).sort()).toEqual([
      'concepts',
      'courses',
      'inspirational-books',
      'library',
      'map',
      'methods',
      'notFound',
      'questionnaires',
      'references',
      'search',
      'start',
      'textbooks',
      'texts',
    ])
  })

  it('show the seven hero Plates in their order', () => {
    expect(heroPlates).toEqual([
      'plate-jeweller',
      'plate-sculptor',
      'plate-farmers',
      'plate-jeweller-woman',
      'plate-painter-bowl',
      'plate-painter-birds',
      'plate-karma-yoga',
    ])
  })

  it('never repeat a Sticker or Interim picture in the topic row', () => {
    const today = Object.values(topicArt).map(({ sticker, interim }) => interim ?? sticker)
    const finished = Object.values(topicArt).map(({ sticker }) => sticker)
    expect(new Set(today).size).toBe(today.length)
    expect(new Set(finished).size).toBe(finished.length)
  })

  it('make a mistyped picture id fail the typecheck', () => {
    // @ts-expect-error a picture that is neither in the registry nor a slot
    const typo: PictureId = 'plate-ahimsaa'
    expect(named()).not.toContain(typo)
  })
})

// What each page head shows while no new picture has a record, from the pictures spec.
const SECTION_HEADS: Record<SectionKey, string> = {
  concepts: 'sticker-cosmos',
  map: 'sticker-cosmos',
  texts: 'sticker-book-ornate',
  questionnaires: 'sticker-clipboard',
  library: 'sticker-book-clasp',
  textbooks: 'sticker-book-clasp',
  'inspirational-books': 'sticker-book-clasp',
  courses: 'sticker-gear',
  methods: 'sticker-mind-tools',
  references: 'sticker-book-clasp',
  start: 'sticker-cosmos',
  search: 'sticker-mind-dome',
  notFound: 'emblem-mark',
}

const TOPIC_CARDS: Record<string, string> = {
  self: 'sticker-cosmos',
  mind: 'sticker-mind-swirl',
  practice: 'sticker-meditation',
  values: 'sticker-book-ornate',
  temperament: 'sticker-gear',
}

const FRONTISPIECES: Record<string, string> = {
  self: 'plate-sage-lights-mind',
  mind: 'plate-sage-paints-mind',
  practice: 'plate-painter-bowl',
  values: 'plate-tree-of-mind',
  temperament: 'plate-farmers',
}

/** A picture made for a slot, unapproved unless the overrides say otherwise. */
function draft(id: string, overrides: Partial<ArtRecord> = {}): ArtRecord {
  return {
    id,
    family: 'plate',
    src: '/art/plates/draft.jpg',
    width: 1024,
    height: 1024,
    alt: 'A draft picture',
    origin: { kind: 'generated', tool: 'A tool', model: 'A model', prompt: 'A brief', made: 'now' },
    licence: 'A licence',
    approved: false,
    ...overrides,
  }
}

describe.each([
  ['drafts on', flagsOn()],
  ['drafts off', flagsOff()],
])('artFor, while no slot has a record, with %s', (_name, flags) => {
  const { artFor: head } = createArt(ART, flags)
  let conceptCards: Awaited<ReturnType<typeof concepts.list>> = []
  let questionnaireCards: Awaited<ReturnType<typeof questionnaires.list>> = []
  let workSlugs: string[] = []

  beforeAll(async () => {
    conceptCards = await concepts.list()
    questionnaireCards = await questionnaires.list()
    workSlugs = (await works.list()).map((card) => card.slug)
  }, 60_000)

  it.each(Object.entries(SECTION_HEADS))('shows the section %s its picture', (key, id) => {
    expect(head({ kind: 'section', key: key as SectionKey }).id).toBe(id)
  })

  it.each(Object.entries(FRONTISPIECES))('heads the topic %s with its Frontispiece', (slug, id) => {
    expect(head({ kind: 'topic', slug }).id).toBe(id)
  })

  it.each(Object.entries(TOPIC_CARDS))('gives the topic card %s its picture', (slug, id) => {
    expect(head({ kind: 'topic-card', slug }).id).toBe(id)
  })

  it('heads every Concept with its primary topic’s picture', () => {
    expect(conceptCards).not.toEqual([])
    for (const card of conceptCards) {
      const picture = head({ kind: 'concept', slug: card.slug, topic: card.topic.slug })
      expect(picture.id, card.slug).toBe(TOPIC_CARDS[card.topic.slug])
    }
  })

  it('heads Karta with the temperament picture, its primary topic', () => {
    const karta = conceptCards.find((card) => card.slug === 'karta')
    expect(karta?.topic.slug).toBe('temperament')
    expect(head({ kind: 'concept', slug: 'karta', topic: 'temperament' }).id).toBe('sticker-gear')
  })

  it('heads every Questionnaire with the clipboard but the KarmaYoga Scale', () => {
    expect(questionnaireCards).not.toEqual([])
    for (const card of questionnaireCards) {
      const picture = head({
        kind: 'questionnaire',
        slug: card.slug,
        firstConcept: card.concepts[0]?.slug,
      })
      expect(picture.id, card.slug).toBe(
        card.slug === 'karmayoga-scale' ? 'plate-karma-yoga' : 'sticker-clipboard',
      )
    }
  })

  it('heads every Traditional text with the ornate book', () => {
    expect(workSlugs).not.toEqual([])
    for (const slug of workSlugs) {
      expect(head({ kind: 'work', slug }).id, slug).toBe('sticker-book-ornate')
    }
  })
})

describe('ownArt, while no slot has a record', () => {
  it.each([
    ['drafts on', flagsOn()],
    ['drafts off', flagsOff()],
  ])('gives every card nothing but the KarmaYoga Scale’s, with %s', async (_name, flags) => {
    const { ownArt: own } = createArt(ART, flags)
    const [conceptCards, workCards, questionnaireCards] = await Promise.all([
      concepts.list(),
      works.list(),
      questionnaires.list(),
    ])
    expect(conceptCards).not.toEqual([])
    for (const { slug } of conceptCards) {
      expect(own({ kind: 'concept', slug }), slug).toBeUndefined()
    }
    for (const { slug } of workCards) expect(own({ kind: 'work', slug }), slug).toBeUndefined()
    for (const { slug } of questionnaireCards) {
      const picture = own({ kind: 'questionnaire', slug })
      if (slug === 'karmayoga-scale') expect(picture?.id).toBe('plate-karma-yoga')
      else expect(picture, slug).toBeUndefined()
    }
  })
})

describe('a slot’s record', () => {
  const concept = { kind: 'concept', slug: 'ahimsa', topic: 'values' } as const

  it('counts as absent while there is none, whichever the flag', () => {
    for (const flags of [flagsOn(), flagsOff()]) {
      const { artFor: head, ownArt: own } = createArt(ART, flags)
      expect(head(concept).id).toBe('sticker-book-ornate')
      expect(own(concept)).toBeUndefined()
    }
  })

  it('shows unapproved only while the draftArt flag is on', () => {
    const records = [...ART, draft('plate-ahimsa')]
    const on = createArt(records, flagsOn())
    expect(on.artFor(concept).id).toBe('plate-ahimsa')
    expect(on.ownArt(concept)?.id).toBe('plate-ahimsa')

    const off = createArt(records, flagsOff())
    expect(off.artFor(concept).id).toBe('sticker-book-ornate')
    expect(off.ownArt(concept)).toBeUndefined()
  })

  it('shows once approved, whichever the flag', () => {
    const records = [...ART, draft('plate-ahimsa', { approved: true })]
    for (const flags of [flagsOn(), flagsOff()]) {
      const { artFor: head, ownArt: own } = createArt(records, flags)
      expect(head(concept).id).toBe('plate-ahimsa')
      expect(own(concept)?.id).toBe('plate-ahimsa')
    }
  })

  it('takes over a section head, a topic card and the 404 page', () => {
    const { artFor: head } = createArt(
      [
        ...ART,
        draft('sticker-library', { family: 'sticker', approved: true }),
        draft('sticker-self', { family: 'sticker', approved: true }),
        draft('plate-404', { approved: true }),
      ],
      flagsOff(),
    )
    expect(head({ kind: 'section', key: 'library' }).id).toBe('sticker-library')
    expect(head({ kind: 'topic-card', slug: 'self' }).id).toBe('sticker-self')
    expect(head({ kind: 'section', key: 'notFound' }).id).toBe('plate-404')
  })

  it('makes a topic’s Sticker the Interim picture of its Concepts', () => {
    const sticker = draft('sticker-self', { family: 'sticker', approved: true })
    const { artFor: head } = createArt([...ART, sticker], flagsOff())
    expect(head({ kind: 'concept', slug: 'atman', topic: 'self' }).id).toBe('sticker-self')
  })

  it('gives a Traditional text its Pothi at the head and on its card', () => {
    const pothi = draft('pothi-dhammapada', { family: 'sticker', approved: true })
    const { artFor: head, ownArt: own } = createArt([...ART, pothi], flagsOff())
    expect(head({ kind: 'work', slug: 'dhammapada' }).id).toBe('pothi-dhammapada')
    expect(own({ kind: 'work', slug: 'dhammapada' })?.id).toBe('pothi-dhammapada')
  })
})

describe('a Questionnaire with no picture of its own', () => {
  const target = { kind: 'questionnaire', slug: 'triguna', firstConcept: 'triguna' } as const

  it('takes its first Concept’s Plate at its head once that Plate can show', () => {
    const { artFor: head } = createArt([...ART, draft('plate-triguna')], flagsOn())
    expect(head(target).id).toBe('plate-triguna')
  })

  it('takes the clipboard while that Plate cannot show, never the Concept’s Interim picture', () => {
    const { artFor: head } = createArt([...ART, draft('plate-triguna')], flagsOff())
    expect(head(target).id).toBe('sticker-clipboard')
  })

  it('takes the clipboard when it names no Concept', () => {
    const { artFor: head } = createArt(ART, flagsOn())
    expect(head({ kind: 'questionnaire', slug: 'dosha-survey' }).id).toBe('sticker-clipboard')
  })

  it('stays bare on its card, even when its first Concept has a Plate', () => {
    const { ownArt: own } = createArt([...ART, draft('plate-triguna')], flagsOn())
    expect(own({ kind: 'questionnaire', slug: 'triguna' })).toBeUndefined()
  })
})

describe('artFor and ownArt from @/art', () => {
  it('read this build’s registry', () => {
    expect(artFor({ kind: 'topic', slug: 'mind' }).id).toBe('plate-sage-paints-mind')
    expect(ownArt({ kind: 'questionnaire', slug: 'karmayoga-scale' })?.id).toBe('plate-karma-yoga')
  })

  it('refuse a topic that does not exist, naming it', () => {
    expect(() => artFor({ kind: 'topic', slug: 'nonesuch' })).toThrow('nonesuch')
    expect(() => artFor({ kind: 'concept', slug: 'x', topic: 'nonesuch' })).toThrow('nonesuch')
  })
})
