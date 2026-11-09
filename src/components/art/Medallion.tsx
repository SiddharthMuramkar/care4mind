import type { CSSProperties } from 'react'
import Image from 'next/image'

import type { ArtRecord } from '@/art'
import { cx } from '@/lib/cx'

import styles from './Medallion.module.css'
import { MedallionRing } from './MedallionRing'

/**
 * A Plate shown cropped to a circle inside its drawn ring. Decorative unless `decorative` is false,
 * when the record's alt speaks for it. With `topic` the ring takes that topic's colour, set as an
 * inline `--topic`, never a second `data-topic` (a Concept card's chip must stay the only one).
 * Its width is inline, so a page sets a narrower one with `max-width` in `className`; the ring and
 * the picture fill the box, whose width and aspect-ratio hold it steady as the picture loads.
 * Where that narrowing crosses the ring's 96 px line, `phoneSize` names the phone width, and below
 * 40rem the ring drawn for that size shows instead.
 */
export function Medallion({
  art,
  size,
  phoneSize,
  topic,
  decorative = true,
  className,
}: {
  art: Pick<ArtRecord, 'src' | 'alt'>
  size: number
  phoneSize?: number
  topic?: string
  decorative?: boolean
  className?: string
}) {
  const style = {
    width: size,
    ...(topic ? { '--topic': `var(--color-topic-${topic})` } : {}),
  } as CSSProperties
  return (
    <span className={cx(styles.medallion, className)} style={style}>
      <Image
        className={styles.picture}
        src={art.src}
        width={size}
        height={size}
        alt={decorative ? '' : art.alt}
      />
      {phoneSize === undefined ? (
        <MedallionRing size={size} />
      ) : (
        <>
          <MedallionRing size={size} className={styles.wideRing} />
          <MedallionRing size={phoneSize} className={styles.phoneRing} />
        </>
      )}
    </span>
  )
}
