/*
 * The navigation's small drawings, cut like a printer's sorts: hairline strokes in the text's
 * colour. Decorative: the control around each is named.
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

/** Search: a reading glass. */
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
    </svg>
  )
}

/** Menu: three rules, set like lines of type, the middle one shorter. */
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
      <path d="M4 6.5h16M4 12h11M4 17.5h16" />
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

/** Opens a panel: a small chevron pointing down, turned up while the panel is open. */
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

/**
 * Done: a tick in a vermilion roundel, like the wordmark's 4. The tick is one stroke
 * (`pathLength` 1), so a parent can ink it in by its dash offset.
 */
export function SealGlyph({ className, tickClassName }: GlyphProps & { tickClassName?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      width="32"
      height="32"
      aria-hidden
      focusable="false"
    >
      <circle cx="16" cy="16" r="15" fill="var(--color-highlight)" />
      <path
        className={tickClassName}
        d="m9.5 16.5 4.5 4.5 8.5-9.5"
        pathLength={1}
        fill="none"
        stroke="var(--color-highlight-ink)"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
