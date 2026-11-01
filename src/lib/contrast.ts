/** WCAG 2.2 contrast between two #rrggbb colours (1 to 21). */
export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  ) as [number, number]
  return (lighter + 0.05) / (darker + 0.05)
}

/** A translucent #rrggbbaa colour laid over an opaque #rrggbb one, blended as the browser blends them. */
export function composite(over: string, under: string): string {
  const top = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(over)
  const bottom = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(under)
  if (!top || !bottom) throw new Error(`expected #rrggbbaa over #rrggbb, got ${over} over ${under}`)
  const alpha = parseInt(top[4] ?? '', 16) / 255
  const channels = [1, 2, 3].map((index) => {
    const blended =
      parseInt(top[index] ?? '', 16) * alpha + parseInt(bottom[index] ?? '', 16) * (1 - alpha)
    return Math.round(blended).toString(16).padStart(2, '0')
  })
  return `#${channels.join('')}`
}

/** Every custom property a stylesheet declares, by its full name (`--color-ground`), comments ignored. */
export function customProperties(css: string): Record<string, string> {
  const uncommented = css.replace(/\/\*[\s\S]*?\*\//g, '')
  return Object.fromEntries(
    [...uncommented.matchAll(/(--[\w-]+):\s*([^;{}]+);/g)].map(([, name = '', value = '']) => [
      name,
      value.trim(),
    ]),
  )
}

/**
 * A colour value resolved to #rrggbb, or #rrggbbaa when translucent: hex as written, `var()` followed
 * through `declarations`, and `color-mix(in srgb, …)` blended as the browser blends it.
 */
export function resolveColour(value: string, declarations: Record<string, string>): string {
  const written = value.trim()
  if (/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(written)) return written.toLowerCase()
  if (written === 'transparent') return '#00000000'
  const alias = /^var\((--[\w-]+)\)$/.exec(written)
  if (alias) {
    const declared = declarations[alias[1] ?? '']
    if (declared === undefined) throw new Error(`${written} is not declared`)
    return resolveColour(declared, declarations)
  }
  const mixed = /^color-mix\(\s*in srgb\s*,(.*)\)$/s.exec(written)
  if (mixed) return mix(mixed[1] ?? '', declarations)
  throw new Error(`can't resolve the colour ${written}`)
}

/** The two colours of a color-mix() in sRGB, each with an optional percentage, blended as CSS Color 5 says. */
function mix(operands: string, declarations: Record<string, string>): string {
  const parts = splitTopLevel(operands).map((part) => {
    const weighted = /^(.*\S)\s+(\d+(?:\.\d+)?)%$/s.exec(part.trim())
    const colour = resolveColour(weighted?.[1] ?? part, declarations)
    return { rgba: channels(colour), weight: weighted ? Number(weighted[2]) / 100 : undefined }
  })
  const [first, second] = parts
  if (parts.length !== 2 || !first || !second)
    throw new Error(`expected two colours in ${operands}`)
  const w1 = first.weight ?? 1 - (second.weight ?? 0.5)
  const w2 = second.weight ?? 1 - w1
  const total = w1 + w2
  // Weights summing under 100% leave the mix that much more transparent.
  const scale = Math.min(total, 1)
  const [p, q] = [w1 / total, w2 / total]
  const alpha = first.rgba[3] * p + second.rgba[3] * q
  const blended = ([0, 1, 2] as const).map((index) =>
    alpha === 0
      ? 0
      : (first.rgba[index] * first.rgba[3] * p + second.rgba[index] * second.rgba[3] * q) / alpha,
  )
  const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  const opacity = Math.round(alpha * scale * 255)
  return `#${blended.map(hex).join('')}${opacity === 255 ? '' : hex(opacity)}`
}

function channels(hex: string): [number, number, number, number] {
  const [r = 0, g = 0, b = 0, a = 255] = (hex.slice(1).match(/../g) ?? []).map((pair) =>
    parseInt(pair, 16),
  )
  return [r, g, b, a / 255]
}

/** A list split at its commas, leaving the commas inside parentheses alone. */
function splitTopLevel(list: string): string[] {
  const parts = ['']
  let depth = 0
  for (const character of list) {
    if (character === '(') depth += 1
    if (character === ')') depth -= 1
    if (character === ',' && depth === 0) parts.push('')
    else parts[parts.length - 1] += character
  }
  return parts
}

function luminance(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!match) throw new Error(`expected a #rrggbb colour, got ${hex}`)
  const [r, g, b] = match.slice(1).map((part) => {
    const channel = parseInt(part, 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * The colour-token pairs every palette must pass. Text pairs need 4.5:1
 * (WCAG 1.4.3); focus rings and the parts that show a control and its state need 3:1 (WCAG 1.4.11).
 */
export const CONTRAST_PAIRS = [
  { foreground: 'ink', background: 'ground', minimum: 4.5 },
  { foreground: 'ink-muted', background: 'ground', minimum: 4.5 },
  { foreground: 'link', background: 'ground', minimum: 4.5 },
  { foreground: 'surface-ink', background: 'surface', minimum: 4.5 },
  { foreground: 'surface-muted', background: 'surface', minimum: 4.5 },
  { foreground: 'surface-link', background: 'surface', minimum: 4.5 },
  { foreground: 'accent-ink', background: 'accent', minimum: 4.5 },
  { foreground: 'highlight-ink', background: 'highlight', minimum: 4.5 },
  { foreground: 'focus', background: 'ground', minimum: 3 },
  { foreground: 'surface-focus', background: 'surface', minimum: 3 },
  { foreground: 'accent', background: 'ground', minimum: 3 },
  // Vermilion marks on the paper: the Folio's rule and the lotus Fleuron.
  { foreground: 'highlight', background: 'surface', minimum: 3 },
  // A pressed control's label over its ink at the ink's strongest; the ink is translucent, so it is laid over the control.
  { foreground: 'ink', background: 'ink-spread', over: 'ground', minimum: 4.5 },
  { foreground: 'surface-ink', background: 'ink-spread', over: 'surface', minimum: 4.5 },

  // Front-end-site ticket 04. Topic hues are drawings, never text, on the page and on paper alike.
  ...(['self', 'mind', 'practice', 'values', 'temperament'] as const).flatMap(
    (topic) =>
      [
        { foreground: `topic-${topic}`, background: 'ground', minimum: 3 },
        { foreground: `topic-${topic}`, background: 'surface', minimum: 3 },
        { foreground: `topic-${topic}`, background: 'panel', minimum: 3 },
        { foreground: `topic-${topic}`, background: 'drawer', minimum: 3 },
      ] as const,
  ),
  // Drawings in vermilion on the indigo page and on the Drawer's paper: the lotus.
  { foreground: 'highlight', background: 'ground', minimum: 3 },
  { foreground: 'highlight', background: 'drawer', minimum: 3 },
  // Badges: a Questionnaire's status and the Proposal label, each written on its own ground.
  { foreground: 'status-live-ink', background: 'status-live', minimum: 4.5 },
  { foreground: 'status-preview-ink', background: 'status-preview', minimum: 4.5 },
  { foreground: 'status-soon-ink', background: 'status-soon', minimum: 4.5 },
  { foreground: 'status-later-ink', background: 'status-later', minimum: 4.5 },
  { foreground: 'proposal-ink', background: 'proposal', minimum: 4.5 },
  // The paper surfaces that rise over the page: text, links and focus rings on each.
  ...(['panel', 'drawer', 'preview'] as const).flatMap(
    (surface) =>
      [
        { foreground: `${surface}-ink`, background: surface, minimum: 4.5 },
        { foreground: `${surface}-muted`, background: surface, minimum: 4.5 },
        { foreground: 'surface-link', background: surface, minimum: 4.5 },
        { foreground: 'surface-focus', background: surface, minimum: 3 },
      ] as const,
  ),
  // The toast: its text and focus ring on its dark slip, and its turmeric edge on the indigo page.
  { foreground: 'toast-ink', background: 'toast', minimum: 4.5 },
  { foreground: 'toast-muted', background: 'toast', minimum: 4.5 },
  { foreground: 'focus', background: 'toast', minimum: 3 },
  { foreground: 'toast-line', background: 'ground', minimum: 3 },
  // Text that numbers or marks, though screen readers skip it: a term's ¶ at rest, the concept
  // contents' numerals, the topic kicker's numeral, and the contents plate's numeral on its lit row,
  // whose 9% vermilion wash is the highlight-wash-9 token below, laid over the paper.
  { foreground: 'surface-muted', background: 'surface', minimum: 4.5 },
  { foreground: 'surface-link', background: 'surface', minimum: 4.5 },
  // Mixed colours that carry text: the A–Z's blank letter, and the paler papers and washes text sits on.
  { foreground: 'surface-blank', background: 'surface', minimum: 4.5 },
  ...(['18', '30', '40', '45', '50'] as const).flatMap(
    (share) =>
      [
        { foreground: 'surface-ink', background: `surface-pale-${share}`, minimum: 4.5 },
        { foreground: 'surface-muted', background: `surface-pale-${share}`, minimum: 4.5 },
        { foreground: 'surface-link', background: `surface-pale-${share}`, minimum: 4.5 },
        { foreground: 'surface-focus', background: `surface-pale-${share}`, minimum: 3 },
      ] as const,
  ),
  ...(['8', '9', '10'] as const).flatMap(
    (share) =>
      [
        {
          foreground: 'surface-ink',
          background: `highlight-wash-${share}`,
          over: 'surface',
          minimum: 4.5,
        },
        {
          foreground: 'surface-muted',
          background: `highlight-wash-${share}`,
          over: 'surface',
          minimum: 4.5,
        },
        {
          foreground: 'surface-link',
          background: `highlight-wash-${share}`,
          over: 'surface',
          minimum: 4.5,
        },
      ] as const,
  ),
] as const
