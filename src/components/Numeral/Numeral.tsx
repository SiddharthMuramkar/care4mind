import { toDevanagariDigits } from '@/lib/text'

export interface NumeralProps {
  /** What to write in Devanagari digits: a number, or a locator such as `1.30`. */
  value: string | number
  className?: string
  /** Decoration beside the same count in Western digits, so assistive technology skips it. */
  decorative?: boolean
}

/** A number in Devanagari digits, always with its language tag (WCAG 3.1.2). */
export function Numeral({ value, className, decorative = false }: NumeralProps) {
  return (
    <span lang="sa-Deva" className={className} {...(decorative ? { 'aria-hidden': true } : {})}>
      {toDevanagariDigits(String(value))}
    </span>
  )
}
