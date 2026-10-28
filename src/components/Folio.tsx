import type { ElementType, ReactNode } from 'react'

import { cx } from '@/lib/cx'

import styles from './Folio.module.css'

interface Props {
  as?: ElementType
  className?: string
  children: ReactNode
  'aria-labelledby'?: string
}

/** A page of paper on the indigo ground, framed by a printer's double rule. */
export function Folio({ as: Element = 'div', className, children, ...rest }: Props) {
  return (
    <Element className={cx(styles.folio, className)} {...rest}>
      <span className={styles.corner} data-corner="tl" aria-hidden />
      <span className={styles.corner} data-corner="tr" aria-hidden />
      <span className={styles.corner} data-corner="bl" aria-hidden />
      <span className={styles.corner} data-corner="br" aria-hidden />
      {children}
    </Element>
  )
}
