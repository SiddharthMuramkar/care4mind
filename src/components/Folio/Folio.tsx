import type { ElementType, ReactNode } from 'react'

import { cx } from '@/lib/cx'

import styles from './Folio.module.css'

interface Props {
  as?: ElementType
  className?: string
  children: ReactNode
  'aria-labelledby'?: string
  /**
   * `frame` is the printer's double rule with diamond corners, which marks the hero alone
   * among folios; `page` is a reading page's paper panel — one thin rule on wide screens,
   * and no frame below 40rem, where its text runs to the page's own 16px margins.
   */
  variant?: 'frame' | 'page'
}

/** The frame's four diamond corners, for the verse and featured cards the frame also marks. */
export function FrameCorners() {
  return (
    <>
      <span className={styles.corner} data-corner="tl" aria-hidden />
      <span className={styles.corner} data-corner="tr" aria-hidden />
      <span className={styles.corner} data-corner="bl" aria-hidden />
      <span className={styles.corner} data-corner="br" aria-hidden />
    </>
  )
}

/** A page of paper on the indigo ground; the `frame` variant is ruled like a printer's frame. */
export function Folio({
  as: Element = 'div',
  className,
  variant = 'frame',
  children,
  ...rest
}: Props) {
  return (
    <Element
      className={cx(styles.folio, variant === 'frame' ? styles.frame : styles.page, className)}
      data-paper
      {...rest}
    >
      {variant === 'frame' ? <FrameCorners /> : null}
      {children}
    </Element>
  )
}
