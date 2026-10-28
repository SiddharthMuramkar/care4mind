/*
 * The navigation's small drawings, in the kolam's hand: round strokes in the text's colour, and a
 * dot that a parent can colour with --glyph-dot. Decorative: the control around each is named.
 */

interface GlyphProps {
  className?: string
}

const common = {
  'aria-hidden': true,
  focusable: 'false',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** Search: one loop round a dot, with a handle. */
export function SearchGlyph({ className }: GlyphProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      strokeWidth={1.75}
      {...common}
    >
      <circle cx="10" cy="10" r="6.5" />
      <path d="m15 15 5.5 5.5" />
      <circle cx="10" cy="10" r="1.9" fill="var(--glyph-dot, currentColor)" stroke="none" />
    </svg>
  )
}

/** Menu: three rules, the middle one ending in a dot. */
export function MenuGlyph({ className }: GlyphProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      strokeWidth={1.75}
      {...common}
    >
      <path d="M4 6.5h16M4 12h10M4 17.5h16" />
      <circle cx="18.25" cy="12" r="1.9" fill="var(--glyph-dot, currentColor)" stroke="none" />
    </svg>
  )
}

/** Close: a cross. */
export function CloseGlyph({ className }: GlyphProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      strokeWidth={1.75}
      {...common}
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

/** Opens a panel: a small curve pointing down, turned up while the panel is open. */
export function ChevronGlyph({ className }: GlyphProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      width="12"
      height="12"
      strokeWidth={1.5}
      {...common}
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  )
}

/** Onward: an arrow along the line of text. */
export function ArrowGlyph({ className }: GlyphProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 12"
      width="16"
      height="12"
      strokeWidth={1.5}
      {...common}
    >
      <path d="M1.5 6h12M9.5 2l4 4-4 4" />
    </svg>
  )
}
