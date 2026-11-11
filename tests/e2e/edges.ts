import type { Locator, Page } from '@playwright/test'

/** A box on the screen, in CSS px. */
interface Box {
  left: number
  right: number
  top: number
  bottom: number
}

/** An ancestor that clips what overflows it, on each axis it clips: `scroll` if it scrolls there. */
interface Clip extends Box {
  x?: 'scroll' | 'hide'
  y?: 'scroll' | 'hide'
  name: string
}

/** A word of text, or a control, where it is drawn. */
interface Piece extends Box {
  kind: 'word' | 'control'
  /** The word, or the control's label, and the element that sets it. */
  name: string
  /** The paper it is set on, or else the screen. */
  surface: { left: number; right: number; name: string }
  /** The clips round it, outermost first: indexes into the layout's clips. */
  clips: number[]
  /** Set in a drawing (an svg), which places and sizes its own labels. */
  drawn: boolean
}

export interface Layout {
  screen: number
  pieces: Piece[]
  clips: Clip[]
}

const SLACK = 0.5

/**
 * Every word and every control under `selector`, as a visitor sees them: hidden text, text read
 * but not seen (sr-only) and the inside of a closed disclosure are left out. Words are measured
 * one by one and never their spaces, since a space at the end of a line hangs past its edge.
 * Run `showDeferred` first, so the parts the browser holds back until they scroll near are laid out.
 */
export function measureLayout(page: Page, selector = 'main#main, body > footer'): Promise<Layout> {
  return page.evaluate((selector) => {
    const screen = document.documentElement.clientWidth
    const clips: Clip[] = []
    const chains = new Map<Element, number[]>()
    const surfaces = new Map<Element, Piece['surface']>()
    const nameOf = (element: Element) =>
      `<${element.localName}${element.classList[0] ? `.${element.classList[0]}` : ''}>`
    const axis = (value: string) =>
      value === 'visible' ? undefined : value === 'auto' || value === 'scroll' ? 'scroll' : 'hide'
    const chainOf = (element: Element | null): number[] => {
      if (!element || element === document.body || element === document.documentElement) return []
      const known = chains.get(element)
      if (known) return known
      const outer = chainOf(element.parentElement)
      const style = getComputedStyle(element)
      const x = axis(style.overflowX)
      const y = axis(style.overflowY)
      let chain = outer
      // Overflow clips only a box of its own: not an inline run, nor an element with no box.
      if ((x || y) && style.display !== 'inline' && style.display !== 'contents') {
        const box = element.getBoundingClientRect()
        const left = box.left + element.clientLeft
        const top = box.top + element.clientTop
        clips.push({
          left,
          right: left + element.clientWidth,
          top,
          bottom: top + element.clientHeight,
          ...(x ? { x } : {}),
          ...(y ? { y } : {}),
          name: nameOf(element),
        })
        chain = [...outer, clips.length - 1]
      }
      chains.set(element, chain)
      return chain
    }
    const surfaceOf = (element: Element): Piece['surface'] => {
      const paper = element.closest('[data-paper]')
      if (!paper) return { left: 0, right: screen, name: 'the screen' }
      const known = surfaces.get(paper)
      if (known) return known
      const box = paper.getBoundingClientRect()
      const surface = { left: box.left, right: box.right, name: `its paper ${nameOf(paper)}` }
      surfaces.set(paper, surface)
      return surface
    }
    const seen = (element: Element) =>
      element.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
      !element.closest('.sr-only, details:not([open]) > :not(summary)')

    const pieces: Piece[] = []
    for (const root of document.querySelectorAll(selector)) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const element = node.parentElement
        const text = node.textContent ?? ''
        if (!element || !/\S/.test(text) || !seen(element)) continue
        const clipsHere = chainOf(element)
        const surface = surfaceOf(element)
        const drawn = element.closest('svg') !== null
        for (const match of text.matchAll(/\S+/g)) {
          const range = document.createRange()
          range.setStart(node, match.index ?? 0)
          range.setEnd(node, (match.index ?? 0) + match[0].length)
          for (const box of range.getClientRects()) {
            if (box.width < 0.5 || box.height < 0.5) continue
            pieces.push({
              kind: 'word',
              name: `“${match[0].slice(0, 30)}” in ${nameOf(element)}`,
              left: box.left,
              right: box.right,
              top: box.top,
              bottom: box.bottom,
              surface,
              clips: clipsHere,
              drawn,
            })
          }
        }
      }
      for (const control of root.querySelectorAll(
        'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])',
      )) {
        if (!seen(control)) continue
        const box = control.getBoundingClientRect()
        // A box a pixel or less across is a control hidden from sight but not from a screen reader.
        if (box.width <= 1 || box.height <= 1) continue
        const label = (control.getAttribute('aria-label') ?? control.textContent ?? '')
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 30)
        pieces.push({
          kind: 'control',
          name: `${nameOf(control)} “${label}”`,
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          surface: surfaceOf(control),
          clips: chainOf(control.parentElement),
          drawn: control.closest('svg') !== null,
        })
      }
    }
    return { screen, pieces, clips }
  }, selector)
}

/** Wait two frames, so a change of size or style has been laid out and painted. */
export function settle(page: Page) {
  return page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  )
}

/**
 * Lay out what the browser holds back until it scrolls near (`content-visibility: auto`), as it
 * stands once a visitor reaches it, so a whole page can be measured from its top.
 */
export async function showDeferred(page: Page) {
  await page.addStyleTag({ content: '* { content-visibility: visible !important; }' })
  await settle(page)
}

/**
 * The part of a piece left in view inside its clips, innermost first, and whether a frame that
 * hides its overflow cut any of it off. Where a frame that scrolls cuts it, the rest is a scroll
 * away: that side is marked cut, and is no edge of the text's own. A clip a pixel or less across
 * is the pattern that hides text from sight but not from a screen reader: nothing in it shows.
 */
function inView(piece: Piece, clips: readonly Clip[]) {
  let { left, right, top, bottom } = piece
  let cutLeft = false
  let cutRight = false
  const hiddenBy: string[] = []
  for (const index of [...piece.clips].reverse()) {
    const clip = clips[index]
    if (!clip) continue
    if (clip.right - clip.left <= 1 || clip.bottom - clip.top <= 1)
      return { shows: false, left, right, top, bottom, cutLeft, cutRight, hiddenBy: [] }
    if (clip.x) {
      const past = left < clip.left - SLACK || right > clip.right + SLACK
      if (past && clip.x === 'hide') hiddenBy.push(clip.name)
      if (left < clip.left - SLACK) cutLeft = true
      if (right > clip.right + SLACK) cutRight = true
      left = Math.max(left, clip.left)
      right = Math.min(right, clip.right)
    }
    if (clip.y) {
      const past = top < clip.top - SLACK || bottom > clip.bottom + SLACK
      if (past && clip.y === 'hide') hiddenBy.push(clip.name)
      top = Math.max(top, clip.top)
      bottom = Math.min(bottom, clip.bottom)
    }
  }
  const shows = right - left > SLACK && bottom - top > SLACK
  return { shows, left, right, top, bottom, cutLeft, cutRight, hiddenBy }
}

/** A list a failure can read: each finding once, the first few in full. */
function listed(findings: readonly string[], most = 15) {
  const once = [...new Set(findings)]
  return once.length > most ? [...once.slice(0, most), `and ${once.length - most} more`] : once
}

/**
 * Each word or control closer than `clearance` px to a side of its surface: the paper it is set
 * on, or else the screen. Check it with `toEqual([])`.
 */
export function nearTheEdge({ pieces, clips }: Layout, clearance: number): string[] {
  return listed(
    pieces.flatMap((piece) => {
      const view = inView(piece, clips)
      if (!view.shows) return []
      const { surface } = piece
      const fromLeft = view.left - surface.left
      const fromRight = surface.right - view.right
      const near = [
        !view.cutLeft && fromLeft < clearance - SLACK
          ? `${fromLeft.toFixed(1)} px from the left`
          : '',
        !view.cutRight && fromRight < clearance - SLACK
          ? `${fromRight.toFixed(1)} px from the right`
          : '',
      ].filter(Boolean)
      return near.length > 0 ? [`${piece.name}: ${near.join(' and ')} of ${surface.name}`] : []
    }),
  )
}

/**
 * Each word or control that runs off the screen or is cut off by a frame that hides its
 * overflow, and each two words drawn over one another. A drawing places its own labels, so its
 * words are left out. Check it with `toEqual([])`.
 */
export function cutOffOrOverlapping({ screen, pieces, clips }: Layout): string[] {
  const findings: string[] = []
  const words: (Box & { name: string })[] = []
  for (const piece of pieces) {
    if (piece.drawn) continue
    const view = inView(piece, clips)
    if (view.hiddenBy.length > 0) findings.push(`${piece.name}: cut off by ${view.hiddenBy[0]}`)
    if (!view.shows) continue
    if (view.left < -SLACK || view.right > screen + SLACK)
      findings.push(
        `${piece.name}: runs off the screen, ${view.left.toFixed(1)}–${view.right.toFixed(1)} px`,
      )
    if (piece.kind !== 'word') continue
    // The middle half of a word's box: its face's ascent and descent overlap the next line's.
    const quarter = (view.bottom - view.top) / 4
    words.push({
      ...view,
      top: view.top + quarter,
      bottom: view.bottom - quarter,
      name: piece.name,
    })
  }
  // Sorted from the top, a word can only overlap those that start above its foot.
  words.sort((a, b) => a.top - b.top)
  for (let at = 0; at < words.length; at += 1) {
    const word = words[at]
    if (!word) continue
    for (let next = at + 1; next < words.length; next += 1) {
      const other = words[next]
      if (!other || other.top >= word.bottom) break
      const across = Math.min(word.right, other.right) - Math.max(word.left, other.left)
      const down = Math.min(word.bottom, other.bottom) - Math.max(word.top, other.top)
      if (across > 2 && down > 1) findings.push(`${word.name} overlaps ${other.name}`)
    }
  }
  return listed(findings)
}

/**
 * The trouble with each verse line on the page: a word closer than `clearance` px to a side of
 * its card (a verse card, else the card or paper it is set on), and a line of the screen holding
 * nothing but a danda. Check it with `toEqual([])`.
 */
export async function verseTrouble(page: Page, clearance: number): Promise<string[]> {
  const findings = await page.evaluate((clearance) => {
    const DANDAS = /^[।॥|‖]+$/u
    const found: string[] = []
    for (const line of document.querySelectorAll('main [data-verse-line]')) {
      if (!line.checkVisibility()) continue
      const quoted = `“${(line.textContent ?? '').trim().slice(0, 40)}”`
      const card = line.closest(':has(> [data-corner]), article, [data-paper]')
      if (!card) {
        found.push(`${quoted} is set in no card`)
        continue
      }
      const edge = card.getBoundingClientRect()
      const words: { word: string; top: number; bottom: number }[] = []
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent ?? ''
        for (const match of text.matchAll(/\S+/g)) {
          const range = document.createRange()
          range.setStart(node, match.index ?? 0)
          range.setEnd(node, (match.index ?? 0) + match[0].length)
          for (const box of range.getClientRects()) {
            if (box.width < 0.5) continue
            const near = Math.min(box.left - edge.left, edge.right - box.right)
            if (near < clearance - 0.5)
              found.push(`“${match[0]}” in ${quoted}: ${near.toFixed(1)} px from its card’s side`)
            words.push({ word: match[0], top: box.top, bottom: box.bottom })
          }
        }
      }
      // Words whose middles sit within half a word's height of each other share a line.
      const rows: { middle: number; height: number; words: string[] }[] = []
      for (const { word, top, bottom } of words) {
        const middle = (top + bottom) / 2
        const height = bottom - top
        const shared = rows.find(
          (row) => Math.abs(row.middle - middle) < Math.min(row.height, height) / 2,
        )
        if (shared) shared.words.push(word)
        else rows.push({ middle, height, words: [word] })
      }
      for (const row of rows)
        if (row.words.every((word) => DANDAS.test(word)))
          found.push(`${quoted}: a line holding only “${row.words.join(' ')}”`)
    }
    return found
  }, clearance)
  return listed(findings)
}

/**
 * Each part of a page's contents (its numerals, its lines and the marker beside the section being
 * read) that reaches past the padding of the paper it is set on. Check it with `toEqual([])`.
 */
export function contentsPastThePadding(contents: Locator): Promise<string[]> {
  return contents.evaluate((nav) => {
    const paper = nav.closest('[data-paper]')
    if (!paper) return ['the contents are set on no paper']
    const style = getComputedStyle(paper)
    const box = paper.getBoundingClientRect()
    const left = box.left + parseFloat(style.paddingLeft)
    const right = box.right - parseFloat(style.paddingRight)
    const past = (from: number, to: number) => from < left - 0.5 || to > right + 0.5
    const found: string[] = []
    for (const link of nav.querySelectorAll('a')) {
      if (!link.checkVisibility()) continue
      const name = `“${(link.textContent ?? '').trim().slice(0, 40)}”`
      const range = document.createRange()
      range.selectNodeContents(link)
      for (const part of range.getClientRects())
        if (part.width > 0.5 && past(part.left, part.right))
          found.push(`${name}: ${part.left.toFixed(1)}–${part.right.toFixed(1)} px`)
      // The marker is drawn whether or not it shows: where it would stand, beside this line.
      const marker = getComputedStyle(link, '::before')
      const from = link.getBoundingClientRect().left + parseFloat(marker.left)
      const to = from + parseFloat(marker.width)
      if (past(from, to))
        found.push(`the marker beside ${name}: ${from.toFixed(1)}–${to.toFixed(1)} px`)
    }
    return found.length > 0 ? [`inside ${left.toFixed(1)}–${right.toFixed(1)} px:`, ...found] : []
  })
}
