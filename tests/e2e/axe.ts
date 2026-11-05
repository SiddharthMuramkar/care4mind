import { readFileSync } from 'node:fs'

import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

import {
  composite,
  CONTRAST_PAIRS,
  contrastRatio,
  customProperties,
  resolveColour,
} from '@/styles/contrast'

// wcag22aa must be asked for explicitly, or axe skips its WCAG 2.2 rule (target size, 2.5.8).
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Structural rules axe tags only best-practice, so no WCAG tag run reaches them; region stays out, as portalled popups and toasts make it noise.
export const STRUCTURAL_RULES = [
  'heading-order',
  'landmark-unique',
  'landmark-one-main',
  'skip-link',
  'aria-dialog-name',
  'empty-heading',
]

// Why axe may leave a contrast unsettled, reviewed: the reason alone never passes a node — its own colours must also form a reviewed pair below.
const UNSETTLED_CONTRAST: readonly { why: string; reason: string }[] = [
  {
    why: 'shortTextContent',
    reason: 'one character of text, as an A–Z letter; its token pair is in the contrast test',
  },
  {
    why: 'pseudoContent',
    reason: 'a decorative pseudo-element, as ink-spread, whose pairs are in the contrast test',
  },
  {
    why: 'bgGradient',
    reason:
      'a gradient in the background stack, as a link’s resting underline; its text colours are tokens',
  },
  {
    why: 'bgOverlap',
    reason: 'covered where it sits, by the sticky header or rail; its colours settle uncovered',
  },
  {
    why: 'elmPartiallyObscured',
    reason: 'partly covered where it sits; its colours settle uncovered',
  },
  {
    why: 'imgNode',
    reason:
      'a label set over a drawing, as the Concept map’s names over its lines; its colours are tokens',
  },
  {
    why: 'elmPartiallyObscuring',
    reason: 'partly covers another element where it sits; its colours settle clear of it',
  },
]

/** The site palette's colour tokens resolved to hex, as the contrast test resolves them. */
let paletteCache: Record<string, string> | undefined
function palette(): Record<string, string> {
  if (paletteCache) return paletteCache
  const css = readFileSync('src/styles/globals.css', 'utf8')
  let colours: Record<string, string> = {}
  for (const [, , body = ''] of css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .matchAll(/([^{}]+)\{([^{}]*--color-ground:[^{}]*)\}/g)) {
    const declarations = { ...customProperties(css), ...customProperties(body) }
    colours = Object.fromEntries(
      Object.entries(customProperties(body))
        .filter(([name]) => name.startsWith('--color-'))
        .map(([name, value]) => [
          name.slice('--color-'.length),
          resolveColour(value, declarations),
        ]),
    )
  }
  paletteCache = colours
  return colours
}

/** The reviewed text pairs as `#rrggbb` on `#rrggbb`, resolved from the site palette, keyed `fg|bg`. */
let reviewedPairCache: Map<string, string> | undefined
function reviewedPairs(): Map<string, string> {
  if (reviewedPairCache) return reviewedPairCache
  const colours = palette()
  const pairs = new Map<string, string>()
  for (const pair of CONTRAST_PAIRS) {
    const foreground = colours[pair.foreground]
    let background = colours[pair.background]
    const under = 'over' in pair ? colours[pair.over] : undefined
    if (!foreground || !background || ('over' in pair && !under)) continue
    if (under) background = composite(background, under)
    if (!/^#[0-9a-f]{6}$/.test(foreground) || !/^#[0-9a-f]{6}$/.test(background)) continue
    const key = `${foreground}|${background}`
    if (!pairs.has(key))
      pairs.set(
        key,
        `${pair.foreground} on ${pair.background}${'over' in pair ? ` over ${pair.over}` : ''}`,
      )
  }
  reviewedPairCache = pairs
  return pairs
}

type ParsedColour = { hex: string; alpha: number }

/** Within a step per channel: the browser and the palette's own arithmetic round a mixed colour's half-steps their own way. */
function nearColour(a: string, b: string): boolean {
  const channels = (hex: string) =>
    [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16))
  return channels(a).every((channel, index) => Math.abs(channel - (channels(b)[index] ?? 0)) <= 1)
}

/** The reviewed pair a node's colours form, allowing that rounding step; the ratio is still judged on the colours read. */
function pairName(pairs: Map<string, string>, foreground: string, background: string) {
  const exact = pairs.get(`${foreground}|${background}`)
  if (exact) return exact
  for (const [key, name] of pairs) {
    const [pairForeground = '', pairBackground = ''] = key.split('|')
    if (nearColour(pairForeground, foreground) && nearColour(pairBackground, background))
      return name
  }
  return undefined
}

/** A computed colour (`rgb()`, `color(srgb …)` from a `color-mix()`, or hex) as `#rrggbb` plus alpha; undefined when unreadable. */
function parseColour(value: string | undefined): ParsedColour | undefined {
  if (!value) return undefined
  const written = value.trim().toLowerCase()
  if (written === 'transparent') return { hex: '#000000', alpha: 0 }
  const hex = /^#([0-9a-f]{6})$/.exec(written)
  if (hex) return { hex: `#${hex[1]}`, alpha: 1 }
  const byte = (channel: number) =>
    Math.max(0, Math.min(255, Math.round(channel)))
      .toString(16)
      .padStart(2, '0')
  const rgb = /^rgba?\(([^)]*)\)$/.exec(written)
  if (rgb) {
    const [channels = '', alpha] = (rgb[1] ?? '').split('/')
    const parts = channels
      .split(/[,\s]+/)
      .filter(Boolean)
      .map(Number)
    if (parts.length < 3 || parts.some(Number.isNaN)) return undefined
    const commas = (rgb[1] ?? '').split(',')
    return {
      hex: `#${parts.slice(0, 3).map(byte).join('')}`,
      alpha: alpha !== undefined ? Number(alpha) : commas.length === 4 ? Number(commas[3]) : 1,
    }
  }
  const srgb = /^color\(srgb\s+([^)]*)\)$/.exec(written)
  if (srgb) {
    const [channels = '', alpha] = (srgb[1] ?? '').split('/')
    const parts = channels.split(/\s+/).filter(Boolean).map(Number)
    if (parts.length < 3 || parts.some(Number.isNaN)) return undefined
    return {
      hex: `#${parts
        .slice(0, 3)
        .map((channel) => byte(channel * 255))
        .join('')}`,
      alpha: alpha !== undefined ? Number(alpha) : 1,
    }
  }
  return undefined
}

/** `over` blended over `under` at its own alpha, as the reader sees it. */
function seen(over: ParsedColour, under: string): string {
  if (over.alpha >= 1) return over.hex
  const alpha = Math.round(over.alpha * 255)
    .toString(16)
    .padStart(2, '0')
  return composite(`${over.hex}${alpha}`, under)
}

type Box = { left: number; top: number; width: number; height: number }

type PaintedLayer = {
  backgroundColor: string
  backgroundImage: string
  backgroundSize: string
  backgroundPosition: string
  backgroundRepeat: string
  backgroundAttachment: string
  opacity: string
  box: Box
  scrollLeft: number
  scrollTop: number
  pseudo?: boolean
}

/** A comma list split outside parentheses, as a background shorthand's layers are. */
function splitLayers(list: string): string[] {
  const parts = ['']
  let depth = 0
  for (const character of list) {
    if (character === '(') depth += 1
    if (character === ')') depth -= 1
    if (character === ',' && depth === 0) parts.push('')
    else parts[parts.length - 1] += character
  }
  return parts.map((part) => part.trim())
}

/** One background length against its painting area: `auto` and its kin take the whole area, as a gradient has no size of its own. */
function tileLength(token: string, area: number): number | undefined {
  if (token === 'auto' || token === 'cover' || token === 'contain') return area
  if (token.endsWith('%')) return (area * Number(token.slice(0, -1))) / 100
  if (token.endsWith('px')) return Number(token.slice(0, -2))
  return undefined
}

/** Where a background tile starts inside its painting area, percentages set as CSS sets them. */
function tileOffset(token: string, area: number, tile: number): number | undefined {
  if (token === 'left' || token === 'top') return 0
  if (token === 'center') return (area - tile) / 2
  if (token === 'right' || token === 'bottom') return area - tile
  if (token.endsWith('%')) return ((area - tile) * Number(token.slice(0, -1))) / 100
  if (token.endsWith('px')) return Number(token.slice(0, -2))
  if (token === '0') return 0
  return undefined
}

/** Whether one background layer paints under the node's glyphs at all, by its tile's size, place and repetition; unreadable geometry counts as covering. */
function paintsUnder(layer: PaintedLayer, index: number, glyphs: Box[]): boolean {
  const sizes = splitLayers(layer.backgroundSize)
  const positions = splitLayers(layer.backgroundPosition)
  const repeats = splitLayers(layer.backgroundRepeat)
  const attachments = splitLayers(layer.backgroundAttachment)
  const pick = (list: string[], fallback: string) =>
    list[index % Math.max(list.length, 1)] ?? fallback
  const size = pick(sizes, 'auto').split(/\s+/)
  const position = pick(positions, '0% 0%').split(/\s+/)
  const repeat = pick(repeats, 'repeat')
  const width = tileLength(size[0] ?? 'auto', layer.box.width)
  const height = tileLength(size[1] ?? size[0] ?? 'auto', layer.box.height)
  if (width === undefined || height === undefined || width === 0 || height === 0)
    return width === 0 || height === 0 ? false : true
  const offsetX = tileOffset(position[0] ?? '0%', layer.box.width, width)
  const offsetY = tileOffset(position[1] ?? position[0] ?? '0%', layer.box.height, height)
  if (offsetX === undefined || offsetY === undefined) return true
  const local = pick(attachments, 'scroll') === 'local'
  const left = layer.box.left + offsetX - (local ? layer.scrollLeft : 0)
  const top = layer.box.top + offsetY - (local ? layer.scrollTop : 0)
  const repeatsX = repeat === 'repeat' || repeat.includes('repeat-x')
  const repeatsY = repeat === 'repeat' || repeat.includes('repeat-y')
  return glyphs.some(
    (glyph) =>
      (repeatsX || (left < glyph.left + glyph.width && glyph.left < left + width)) &&
      (repeatsY || (top < glyph.top + glyph.height && glyph.top < top + height)),
  )
}

/** The backgrounds a node may sit on — its solid ground, and each covering gradient's stops over it in turn; undefined when a layer can't be settled here either. */
function candidateBackgrounds(
  layers: PaintedLayer[],
  glyphs: Box[],
): { solid: string; candidates: string[] } | undefined {
  const translucent: ParsedColour[] = []
  const gradients: ParsedColour[][] = []
  let base: string | undefined
  for (const layer of layers) {
    // A covering pseudo-element, as a chosen pill's indigo, is a background only where its box meets the glyphs.
    if (
      layer.pseudo &&
      !glyphs.some(
        (glyph) =>
          layer.box.left < glyph.left + glyph.width &&
          glyph.left < layer.box.left + layer.box.width &&
          layer.box.top < glyph.top + glyph.height &&
          glyph.top < layer.box.top + layer.box.height,
      )
    )
      continue
    const images = splitLayers(layer.backgroundImage)
    for (const [index, image] of images.entries()) {
      if (image === 'none' || image === '') continue
      // A gradient strip painted away from the node, as a table frame's scroll shadows, is no background of its text; one sized to nothing, as a link's resting underline, paints nothing either.
      if (!paintsUnder(layer, index, glyphs)) continue
      if (!image.includes('gradient(')) return undefined
      const stops = [...image.matchAll(/rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-f]{6}\b/gi)].flatMap(
        ([raw]) => parseColour(raw) ?? [],
      )
      if (stops.length === 0) return undefined
      gradients.push(stops)
    }
    const solid = parseColour(layer.backgroundColor)
    if (solid && solid.alpha > 0) {
      if (solid.alpha >= 1) {
        base = solid.hex
        break
      }
      translucent.push(solid)
    }
  }
  let candidates = [base ?? '#ffffff']
  for (let index = translucent.length - 1; index >= 0; index -= 1) {
    const over = translucent[index]
    if (over) candidates = candidates.map((under) => seen(over, under))
  }
  const solid = candidates[0] ?? '#ffffff'
  for (let index = gradients.length - 1; index >= 0; index -= 1) {
    const stops = gradients[index] ?? []
    candidates = stops.flatMap((stop) => candidates.map((under) => seen(stop, under)))
    if (candidates.length > 16) return undefined
  }
  return { solid, candidates: [...new Set(candidates)] }
}

/**
 * Scan what is on screen now; open menus, popovers and panels before calling it. A failure
 * lists each rule broken, what it asks for and where; `where` names the page and width too.
 */
export async function expectNoAxeViolations(page: Page, where?: string) {
  // One run takes tags or rules, never both, so the structural rules run beside the WCAG tags.
  const wcag = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  const structural = await new AxeBuilder({ page }).withRules(STRUCTURAL_RULES).analyze()
  const violations: {
    rule: string
    impact: string | null | undefined
    help: string
    targets: string[]
  }[] = [...wcag.violations, ...structural.violations].map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.map((node) => node.target.join(' ')),
  }))

  const unsettled = wcag.incomplete
    .filter((result) => result.id === 'color-contrast')
    .flatMap((result) =>
      result.nodes.map((node) => {
        const data = (node.any[0]?.data ?? {}) as {
          messageKey?: string
          fgColor?: string
          bgColor?: string
        }
        return {
          why: String(data.messageKey ?? 'unknown'),
          target: node.target.join(' '),
          axeForeground: parseColour(data.fgColor),
          axeBackground: parseColour(data.bgColor),
        }
      }),
    )
  // Axe names no colours for most unsettled nodes, so read each node's own paint in one visit.
  const painted =
    unsettled.length === 0
      ? []
      : await page.evaluate(
          (selectors: string[]) => {
            return selectors.map((selector) => {
              let element: Element | null = null
              try {
                element = document.querySelector(selector)
              } catch {
                return null
              }
              if (!element) return null
              const style = getComputedStyle(element)
              const isSvg = element.namespaceURI === 'http://www.w3.org/2000/svg'
              const boxOf = (target: Element): Box => {
                const rect = target.getBoundingClientRect()
                return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
              }
              const length = (value: string, basis: number): number | undefined => {
                if (value.endsWith('px')) return Number(value.slice(0, -2))
                if (value.endsWith('%')) return (basis * Number(value.slice(0, -1))) / 100
                return undefined
              }
              const layers: PaintedLayer[] = []
              let current: Element | null = element
              while (current) {
                const paintedStyle = getComputedStyle(current)
                const owner = boxOf(current)
                // A positioned pseudo-element may be the very paint under the text, as a chosen pill's indigo.
                for (const pseudo of ['::before', '::after'] as const) {
                  const pseudoStyle = getComputedStyle(current, pseudo)
                  if (
                    pseudoStyle.content === 'none' ||
                    Number(pseudoStyle.opacity) === 0 ||
                    (pseudoStyle.position !== 'absolute' && pseudoStyle.position !== 'fixed') ||
                    (pseudoStyle.backgroundColor === 'rgba(0, 0, 0, 0)' &&
                      pseudoStyle.backgroundImage === 'none')
                  )
                    continue
                  const left = length(pseudoStyle.left, owner.width)
                  const right = length(pseudoStyle.right, owner.width)
                  const width =
                    length(pseudoStyle.width, owner.width) ??
                    (left !== undefined && right !== undefined
                      ? owner.width - left - right
                      : owner.width)
                  const top = length(pseudoStyle.top, owner.height)
                  const bottom = length(pseudoStyle.bottom, owner.height)
                  const height =
                    length(pseudoStyle.height, owner.height) ??
                    (top !== undefined && bottom !== undefined
                      ? owner.height - top - bottom
                      : owner.height)
                  layers.push({
                    backgroundColor: pseudoStyle.backgroundColor,
                    backgroundImage: pseudoStyle.backgroundImage,
                    backgroundSize: pseudoStyle.backgroundSize,
                    backgroundPosition: pseudoStyle.backgroundPosition,
                    backgroundRepeat: pseudoStyle.backgroundRepeat,
                    backgroundAttachment: pseudoStyle.backgroundAttachment,
                    opacity: pseudoStyle.opacity,
                    box: {
                      left:
                        owner.left +
                        (left ?? (right !== undefined ? owner.width - right - width : 0)),
                      top:
                        owner.top +
                        (top ?? (bottom !== undefined ? owner.height - bottom - height : 0)),
                      width,
                      height,
                    },
                    scrollLeft: 0,
                    scrollTop: 0,
                    pseudo: true,
                  })
                }
                layers.push({
                  backgroundColor: paintedStyle.backgroundColor,
                  backgroundImage: paintedStyle.backgroundImage,
                  backgroundSize: paintedStyle.backgroundSize,
                  backgroundPosition: paintedStyle.backgroundPosition,
                  backgroundRepeat: paintedStyle.backgroundRepeat,
                  backgroundAttachment: paintedStyle.backgroundAttachment,
                  opacity: paintedStyle.opacity,
                  box: boxOf(current),
                  scrollLeft: current instanceof HTMLElement ? current.scrollLeft : 0,
                  scrollTop: current instanceof HTMLElement ? current.scrollTop : 0,
                })
                current = current.parentElement
              }
              // Where the glyphs are, line by line, rather than the whole box they sit in.
              const range = document.createRange()
              range.selectNodeContents(element)
              const glyphs = [...range.getClientRects()]
                .filter((rect) => rect.width > 0 && rect.height > 0)
                .map((rect) => ({
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                }))
              return {
                color: isSvg && style.fill && style.fill !== 'none' ? style.fill : style.color,
                glyphs: glyphs.length > 0 ? glyphs : [boxOf(element)],
                layers,
              }
            })
          },
          unsettled.map((node) => node.target),
        )
  const pairs = reviewedPairs()
  // One reviewed shade beside the pairs: a table frame's scroll shadow over a reviewed solid pair — an edge shade, strongest where the frame clips the glyphs.
  const shade = palette()['scroll-shadow']
  const unreviewed: string[] = []
  for (const [index, node] of unsettled.entries()) {
    const reviewed = UNSETTLED_CONTRAST.find((entry) => entry.why === node.why)
    const own = painted[index]
    const foreground = node.axeForeground ?? parseColour(own?.color)
    let backgrounds: string[] | undefined
    let solid: string | undefined
    let opacity = 1
    if (node.axeForeground && node.axeBackground) {
      solid = seen(node.axeBackground, '#ffffff')
      backgrounds = [solid]
    } else if (own) {
      const found = candidateBackgrounds(own.layers, own.glyphs)
      backgrounds = found?.candidates
      solid = found?.solid
      // Text inside a translucent group blends toward what it sits on; the opaque layer that ends the walk is that ground, so its own opacity is left out.
      let depth = 0
      for (const layer of own.layers) {
        depth += 1
        const paintedSolid = parseColour(layer.backgroundColor)
        if (paintedSolid && paintedSolid.alpha >= 1) break
      }
      opacity = own.layers
        .slice(0, Math.max(depth - 1, 0))
        .reduce((product, layer) => product * Number(layer.opacity || 1), 1)
    }
    const textOn = (background: string) =>
      foreground
        ? seen({ hex: foreground.hex, alpha: foreground.alpha * opacity }, background)
        : undefined
    const solidText = solid ? textOn(solid) : undefined
    const solidPair = solidText && solid ? pairName(pairs, solidText, solid) : undefined
    const solidPasses =
      solidPair !== undefined &&
      solidText !== undefined &&
      solid !== undefined &&
      contrastRatio(solidText, solid) >= 4.5
    const shaded =
      solid && shade && /^#[0-9a-f]{8}$/.test(shade)
        ? [composite(shade, solid), composite(shade, composite(shade, solid))]
        : []
    const checks = (backgrounds ?? []).map((background) => {
      const text = textOn(background)
      const pair = text ? pairName(pairs, text, background) : undefined
      const ratio = text ? contrastRatio(text, background) : undefined
      const byPair = pair !== undefined && ratio !== undefined && ratio >= 4.5
      const byShade =
        node.why === 'bgGradient' &&
        solidPasses &&
        shaded.some((expected) => nearColour(expected, background))
      return {
        background,
        text,
        pair: pair ?? (byShade ? `scroll-shadow over ${solidPair}` : undefined),
        ratio,
        passes: byPair || byShade,
      }
    })
    const passes =
      reviewed !== undefined && checks.length > 0 && checks.every((check) => check.passes)
    const evidence = checks
      .map(
        (check) =>
          `${check.text ?? 'unknown text'} on ${check.background}${check.pair ? ` (${check.pair})` : ' (no reviewed pair)'}${check.ratio !== undefined ? ` ${check.ratio.toFixed(2)}:1` : ''}`,
      )
      .join(', ')
    console.log(
      `axe color-contrast unsettled${where ? ` (${where})` : ''}: ${node.why} ${node.target} — ${evidence || 'no colours could be read'}${reviewed ? ` — ${reviewed.reason}` : ''}`,
    )
    if (!passes)
      unreviewed.push(`${node.why}: ${node.target} — ${evidence || 'no colours could be read'}`)
  }
  if (unreviewed.length > 0) {
    violations.push({
      rule: 'color-contrast',
      impact: 'unsettled',
      help: 'axe could not settle this contrast and its colours form no reviewed pair at 4.5:1; fix the colour or record its pair',
      targets: unreviewed,
    })
  }
  expect(violations, where).toEqual([])
}
