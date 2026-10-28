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
  // The "Devanagari first" switch, on the paper: its printer's-rule track, and its vermilion roundel knob.
  { foreground: 'surface-ink', background: 'surface', minimum: 3 },
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
  // Badges: a Questionnaire's status and the Proposal label, each written on its own ground.
  { foreground: 'status-live-ink', background: 'status-live', minimum: 4.5 },
  { foreground: 'status-preview-ink', background: 'status-preview', minimum: 4.5 },
  { foreground: 'status-soon-ink', background: 'status-soon', minimum: 4.5 },
  { foreground: 'status-later-ink', background: 'status-later', minimum: 4.5 },
  { foreground: 'proposal-ink', background: 'proposal', minimum: 4.5 },
  // The paper surfaces that rise over the page: text, links and focus rings on each.
  ...(['panel', 'drawer', 'palette', 'preview'] as const).flatMap(
    (surface) =>
      [
        { foreground: `${surface}-ink`, background: surface, minimum: 4.5 },
        { foreground: `${surface}-muted`, background: surface, minimum: 4.5 },
        { foreground: 'surface-link', background: surface, minimum: 4.5 },
        { foreground: 'surface-focus', background: surface, minimum: 3 },
      ] as const,
  ),
  { foreground: 'palette-highlight-ink', background: 'palette-highlight', minimum: 4.5 },
  // The toast: its text and focus ring on its dark slip, and its turmeric edge on the indigo page.
  { foreground: 'toast-ink', background: 'toast', minimum: 4.5 },
  { foreground: 'toast-muted', background: 'toast', minimum: 4.5 },
  { foreground: 'focus', background: 'toast', minimum: 3 },
  { foreground: 'toast-line', background: 'ground', minimum: 3 },
  // Book cloth: a spine's title on its cloth.
  { foreground: 'cloth-indigo-ink', background: 'cloth-indigo', minimum: 4.5 },
  { foreground: 'cloth-madder-ink', background: 'cloth-madder', minimum: 4.5 },
  { foreground: 'cloth-turmeric-ink', background: 'cloth-turmeric', minimum: 4.5 },
  { foreground: 'cloth-neem-ink', background: 'cloth-neem', minimum: 4.5 },
  { foreground: 'cloth-teak-ink', background: 'cloth-teak', minimum: 4.5 },
] as const

export type ColourToken = (typeof CONTRAST_PAIRS)[number]['foreground' | 'background']
