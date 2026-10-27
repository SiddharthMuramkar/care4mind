import { cx } from '@/lib/cx'

import styles from './Fleuron.module.css'

/** A lotus-petal printer's ornament, drawn as line art. Decorative. */
export function Fleuron({ className }: { className?: string }) {
  return (
    <svg
      className={cx(styles.fleuron, className)}
      viewBox="0 0 160 40"
      aria-hidden
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M80 4c7 9 7 21 0 32-7-11-7-23 0-32Z" />
        <path d="M80 36c-9-8-20-11-31-9 8-8 22-7 31 9Z" />
        <path d="M80 36c9-8 20-11 31-9-8-8-22-7-31 9Z" />
        <path d="M2 30h40M118 30h40" />
      </g>
      <circle cx="80" cy="18" r="2.2" fill="currentColor" />
    </svg>
  )
}
