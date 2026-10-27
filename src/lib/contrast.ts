/** WCAG 2.2 contrast between two #rrggbb colours (1 to 21). */
export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  ) as [number, number]
  return (lighter + 0.05) / (darker + 0.05)
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
 * (WCAG 1.4.3); focus rings and control edges need 3:1 (WCAG 1.4.11).
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
] as const

export type ColourToken = (typeof CONTRAST_PAIRS)[number]['foreground' | 'background']
