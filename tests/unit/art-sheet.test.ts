import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import sharp from 'sharp'
import { afterAll, describe, expect, it } from 'vitest'

import { SLOTS } from '@/art/slots'

// `pnpm art:sheet`, the parts with no browser: which briefs it plans, what the page holds, the
// thumbnails it writes and which candidates it picks up. The PDF itself is checked by looking at it.

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
  writeThumbs(plan: Brief[], colours: Colours, inbox: string, root: string): Promise<void>
}

const readJson = (path: string) => JSON.parse(readFileSync(resolve(path), 'utf8'))
const briefs = readJson('art/prompts.json').pictures as Inputs['briefs']
const originals = readJson('scripts/art/originals.json').files as Inputs['originals']
const plan = (candidates: Inputs['candidates'] = {}) =>
  sheet.planSheet({ slots: SLOTS, briefs, candidates, originals })
const COLOURS = { paper: '#eadbb6', indigo: '#151a3d', page: '#f6eedb', ink: '#1d1a2e' }

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

  it('keeps both grounds in forced colours, where the browser would paint them alike', () => {
    expect(page()).toMatch(/\.ground \{[^}]*forced-color-adjust: none/)
  })

  it('puts the circle on Plates only', () => {
    const html = page()
    const plate = sectionOf(html, 'plate-ahimsa')
    expect(count(plate, 'class="picture mask"')).toBe(12)
    expect(count(plate, 'class="empty mask"')).toBe(24)
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

  it('names the id and placement, and nothing about where a picture came from', () => {
    const section = sectionOf(page(), 'plate-ahimsa')
    expect(section).toContain('plate-ahimsa')
    expect(section).toContain('concept: ahimsa')
    expect(section).not.toMatch(/licen[cs]e|origin|credit|source/i)
  })
})

describe('the thumbnails', () => {
  const inbox = mkdtempSync(join(tmpdir(), 'art-sheet-thumbs-'))
  afterAll(() => {
    rmSync(inbox, { recursive: true, force: true })
  })

  it('flatten a clear picture onto each ground, at the addresses the page uses', async () => {
    const file = join(inbox, 'sticker-self/1.png')
    mkdirSync(dirname(file), { recursive: true })
    await sharp({
      create: { width: 40, height: 40, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .png()
      .toFile(file)
    const planned = plan({ 'sticker-self': { 1: file } })

    await sheet.writeThumbs(planned, COLOURS, inbox, resolve('.'))

    const addresses = [...sheet.renderSheet(planned, COLOURS).matchAll(/ src="([^"]+)"/g)].map(
      (match) => match[1] ?? '',
    )
    expect(addresses.length).toBeGreaterThan(0)
    for (const address of addresses) expect(existsSync(join(inbox, address)), address).toBe(true)

    for (const [ground, rgb] of [
      ['paper', [0xea, 0xdb, 0xb6]],
      ['indigo', [0x15, 0x1a, 0x3d]],
    ] as const) {
      const { data } = await sharp(join(inbox, `.thumbs/sticker-self/1-${ground}.jpg`))
        .raw()
        .toBuffer({ resolveWithObject: true })
      rgb.forEach((level, channel) => {
        expect(Math.abs((data[channel] ?? 0) - level), ground).toBeLessThanOrEqual(2)
      })
    }
  })

  it('shrink a large picture to the thumbnail size and never enlarge a small one', async () => {
    const make = async (name: string, width: number, height: number) => {
      const file = join(inbox, 'sticker-self', name)
      mkdirSync(dirname(file), { recursive: true })
      await sharp({ create: { width, height, channels: 3, background: '#808080' } })
        .png()
        .toFile(file)
      return file
    }
    const planned = plan({
      'sticker-self': { 2: await make('2.png', 960, 600), 3: await make('3.png', 300, 200) },
    })

    await sheet.writeThumbs(planned, COLOURS, inbox, resolve('.'))

    const size = (number: number, ground: string) =>
      sharp(join(inbox, `.thumbs/sticker-self/${String(number)}-${ground}.jpg`)).metadata()
    for (const ground of ['paper', 'indigo']) {
      expect(await size(2, ground), ground).toMatchObject({ width: 480, height: 300 })
      expect(await size(3, ground), ground).toMatchObject({ width: 300, height: 200 })
    }
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

  it('warns about a loose file, which is likely a candidate out of its folder', () => {
    const { found, warnings } = inbox(['sticker-self.png'])
    expect(found).toEqual({})
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('sticker-self.png')
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
  it('are read from the custom property behind each', () => {
    const css = `:root {
      --press-paper-fresh: #a1a1a1;
      --press-paper-ink: #b2b2b2;
      --press-indigo: #c3c3c3;
      --press-paper: #d4d4d4;
    }`
    expect(sheet.readColours(css)).toEqual({
      paper: '#d4d4d4',
      indigo: '#c3c3c3',
      page: '#a1a1a1',
      ink: '#b2b2b2',
    })
  })

  it('are all in the site’s stylesheet', () => {
    const colours = sheet.readColours(readFileSync(resolve('src/styles/globals.css'), 'utf8'))
    expect(Object.keys(colours)).toHaveLength(4)
    for (const value of Object.values(colours)) expect(value).toMatch(/^#[0-9a-f]{3,8}$/i)
  })

  it('stop the sheet when one is missing', () => {
    expect(() => sheet.readColours(':root { --press-paper: #eadbb6; }')).toThrow(/--press-indigo/)
  })
})
