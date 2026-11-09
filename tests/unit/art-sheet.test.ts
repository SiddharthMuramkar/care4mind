import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, describe, expect, it } from 'vitest'

import { SLOTS } from '@/art/slots'

// `pnpm art:sheet`, the parts with no browser: which briefs it plans, what the page holds and which
// candidates it picks up. The PDF itself is checked by looking at it.

interface Place {
  thumb: string | null
}

interface Brief {
  id: string
  placement: string
  brief: string
  masked: boolean
  candidates: Place[]
  references: (Place & { id: string })[]
}

interface Colours {
  paper: string
  indigo: string
  page: string
  ink: string
}

interface Inputs {
  slots: readonly { id: string; placement: string }[]
  briefs: Record<string, { template: string; brief: string }>
  candidates: Record<string, Record<number, string>>
  originals: { newId: string; newSrc: string; verdict: string }[]
}

const sheet = (await import(pathToFileURL(resolve('scripts/art/sheet.mjs')).href)) as {
  planSheet(inputs: Inputs): Brief[]
  renderSheet(plan: Brief[], colours: Colours): string
  readColours(css: string): Colours
  findCandidates(
    inbox: string,
    slotIds: readonly string[],
    warn: (text: string) => void,
  ): Inputs['candidates']
  PDF_OPTIONS: { printBackground: boolean; preferCSSPageSize: boolean }
}

const readJson = (path: string) => JSON.parse(readFileSync(resolve(path), 'utf8'))
const briefs = readJson('art/prompts.json').pictures as Inputs['briefs']
const originals = readJson('scripts/art/originals.json').files as Inputs['originals']
const plan = (candidates: Inputs['candidates'] = {}) =>
  sheet.planSheet({ slots: SLOTS, briefs, candidates, originals })

describe('the sheet plan', () => {
  it('has one brief for each of the 32 slots and none for the Dosha Survey', () => {
    const ids = plan().map((brief) => brief.id)
    expect(ids).toHaveLength(32)
    expect(new Set(ids).size).toBe(32)
    expect(ids).not.toContain('plate-dosha-survey')
  })

  it('sets two of the client’s own pictures from the same family beside each brief', () => {
    const referencesOf = (id: string) =>
      plan()
        .find((brief) => brief.id === id)
        ?.references.map((reference) => reference.id)
    expect(referencesOf('sticker-self')).toEqual(['sticker-cosmos', 'sticker-meditation'])
    expect(referencesOf('pothi-dhammapada')).toEqual(['sticker-book-ornate', 'sticker-book-clasp'])
    expect(referencesOf('plate-ahimsa')).toEqual(['plate-jeweller-woman', 'plate-sculptor'])
  })

  it('refuses a reference the client did not keep', () => {
    const without = originals.filter((file) => file.newId !== 'sticker-cosmos')
    expect(() =>
      sheet.planSheet({ slots: SLOTS, briefs, candidates: {}, originals: without }),
    ).toThrow(/sticker-cosmos/)
  })

  it('masks Plates and leaves Stickers and Pothis whole', () => {
    const masked = (id: string) => plan().find((brief) => brief.id === id)?.masked
    expect(masked('plate-ahimsa')).toBe(true)
    expect(masked('sticker-self')).toBe(false)
    expect(masked('pothi-dhammapada')).toBe(false)
  })

  it('keeps four places per brief, filling only those with a candidate', () => {
    const planned = plan({ 'sticker-self': { 2: '/inbox/sticker-self/2.png' } })
    const places = planned.find((brief) => brief.id === 'sticker-self')?.candidates
    expect(places?.map((place) => place.thumb)).toEqual([
      null,
      '.thumbs/sticker-self/2',
      null,
      null,
    ])
  })
})

describe('the sheet page', () => {
  const COLOURS = { paper: '#eadbb6', indigo: '#151a3d', page: '#f6eedb', ink: '#1d1a2e' }
  const page = (candidates: Inputs['candidates'] = {}) =>
    sheet.renderSheet(plan(candidates), COLOURS)
  const count = (html: string, text: string) => html.split(text).length - 1
  /** The markup of one brief. */
  const sectionOf = (html: string, id: string) =>
    html.split('<section').find((part) => part.includes(`data-brief="${id}"`)) ?? ''

  it('shows every brief, with no candidates, as empty places beside the client’s pictures', () => {
    const html = page()
    expect(count(html, '<section')).toBe(32)
    for (const { id } of SLOTS) {
      const section = sectionOf(html, id)
      // Four places and two references, at three sizes, on two grounds.
      expect(count(section, 'data-place="empty"'), id).toBe(24)
      expect(count(section, 'data-place="filled"'), id).toBe(12)
    }
  })

  it('shows a dropped candidate at all three sizes on both grounds', () => {
    const section = sectionOf(
      page({ 'sticker-self': { 1: '/inbox/sticker-self/1.png' } }),
      'sticker-self',
    )
    expect(count(section, 'data-place="empty"')).toBe(18)
    expect(count(section, 'data-place="filled"')).toBe(18)
    for (const ground of ['paper', 'indigo'])
      for (const size of [64, 120, 240])
        expect(section).toContain(
          `src=".thumbs/sticker-self/1-${ground}.jpg" width="${size}" height="${size}"`,
        )
  })

  it('draws each ground from the colours it is given', () => {
    const html = page()
    expect(html).toContain('background: #eadbb6')
    expect(html).toContain('background: #151a3d')
    expect(count(sectionOf(html, 'sticker-self'), 'data-ground=')).toBe(2)
  })

  it('puts the circle on Plates only', () => {
    const html = page()
    expect(sectionOf(html, 'plate-ahimsa')).toContain('mask')
    expect(sectionOf(html, 'sticker-self')).not.toContain('mask')
    expect(sectionOf(html, 'pothi-dhammapada')).not.toContain('mask')
  })

  it('escapes the brief', () => {
    const html = sheet.renderSheet(
      plan().map((brief) => ({ ...brief, brief: 'Ahiṃsā <b>& more</b>' })),
      COLOURS,
    )
    expect(html).toContain('Ahiṃsā &lt;b&gt;&amp; more&lt;/b&gt;')
    expect(html).toContain('<meta charset="utf-8">')
  })

  it('loads every picture at once, so the PDF prints no blanks', () => {
    expect(page()).not.toContain('loading=')
  })

  it('names the id and placement, and nothing about where a picture came from', () => {
    const section = sectionOf(page(), 'plate-ahimsa')
    expect(section).toContain('plate-ahimsa')
    expect(section).toContain('concept: ahimsa')
    expect(section).not.toMatch(/licen[cs]e|origin|credit|source/i)
  })

  it('prints with backgrounds on, because the two grounds are the point', () => {
    expect(sheet.PDF_OPTIONS.printBackground).toBe(true)
    expect(sheet.PDF_OPTIONS.preferCSSPageSize).toBe(true)
  })
})

describe('the candidates in the inbox', () => {
  const made: string[] = []
  afterAll(() => {
    for (const folder of made) rmSync(folder, { recursive: true, force: true })
  })

  /** An inbox holding these files, with the warnings a run over it gives. */
  function inbox(files: readonly string[]) {
    const root = mkdtempSync(join(tmpdir(), 'art-sheet-'))
    made.push(root)
    for (const file of files) {
      mkdirSync(dirname(join(root, file)), { recursive: true })
      writeFileSync(join(root, file), '')
    }
    const warnings: string[] = []
    const found = sheet.findCandidates(root, ['sticker-self', 'plate-ahimsa'], (text) =>
      warnings.push(text),
    )
    return { root, found, warnings }
  }

  it('is nothing at all when the inbox does not exist yet', () => {
    const warnings: string[] = []
    const found = sheet.findCandidates(join(tmpdir(), 'art-sheet-no-such-inbox'), ['a'], (text) =>
      warnings.push(text),
    )
    expect(found).toEqual({})
    expect(warnings).toEqual([])
  })

  it('picks up a PNG, a JPEG and a WebP under their slot ids, by number', () => {
    const { root, found, warnings } = inbox([
      'sticker-self/1.png',
      'sticker-self/3.webp',
      'plate-ahimsa/2.JPG',
    ])
    expect(found).toEqual({
      'sticker-self': { 1: join(root, 'sticker-self/1.png'), 3: join(root, 'sticker-self/3.webp') },
      'plate-ahimsa': { 2: join(root, 'plate-ahimsa/2.JPG') },
    })
    expect(warnings).toEqual([])
  })

  it('leaves the sheet’s own files alone and says nothing about them', () => {
    const { found, warnings } = inbox([
      'sheet.html',
      'sheet.pdf',
      '.thumbs/sticker-self/1-paper.jpg',
      'sticker-self/.DS_Store',
    ])
    expect(found).toEqual({ 'sticker-self': {} })
    expect(warnings).toEqual([])
  })

  it('warns about a folder that is not a slot, which is likely a typo', () => {
    const { found, warnings } = inbox(['sticker-slef/1.png'])
    expect(found).toEqual({})
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('sticker-slef')
  })

  it('shows numbers 1 to 4 and warns about any other file', () => {
    const { root, found, warnings } = inbox([
      'sticker-self/1.png',
      'sticker-self/5.png',
      'sticker-self/best.png',
      'sticker-self/notes.txt',
    ])
    expect(found).toEqual({ 'sticker-self': { 1: join(root, 'sticker-self/1.png') } })
    expect(warnings).toHaveLength(3)
    expect(warnings.join('\n')).toMatch(/5\.png[\s\S]*best\.png[\s\S]*notes\.txt/)
  })

  it('warns when one number has two files, and shows the first', () => {
    const { root, found, warnings } = inbox(['sticker-self/1.jpg', 'sticker-self/1.png'])
    expect(found).toEqual({ 'sticker-self': { 1: join(root, 'sticker-self/1.jpg') } })
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('1.png')
  })
})

describe('the Press colours', () => {
  it('are read from the stylesheet', () => {
    expect(sheet.readColours(readFileSync(resolve('src/styles/globals.css'), 'utf8'))).toEqual({
      paper: '#eadbb6',
      indigo: '#151a3d',
      page: '#f6eedb',
      ink: '#1d1a2e',
    })
  })

  it('stop the sheet when one is missing', () => {
    expect(() => sheet.readColours(':root { --press-paper: #eadbb6; }')).toThrow(/--press-indigo/)
  })
})
