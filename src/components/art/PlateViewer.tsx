import Image from 'next/image'

import type { ArtRecord } from '@/art'
import { cx } from '@/lib/cx'

import { MedallionRing } from './MedallionRing'
import styles from './PlateViewer.module.css'

/**
 * The homepage's paintings: the first Plate as a Medallion, its caption and the row its controls
 * stand in. Takes only what it shows, so that a picture's origin never reaches the browser.
 */
export function PlateViewer({
  plates,
  className,
}: {
  plates: readonly Pick<ArtRecord, 'src' | 'width' | 'height' | 'alt' | 'caption'>[]
  className?: string
}) {
  const plate = plates[0]
  if (!plate) return null
  return (
    <figure className={cx(styles.viewer, className)}>
      <div className={styles.medallion}>
        <Image
          className={styles.picture}
          src={plate.src}
          width={plate.width}
          height={plate.height}
          alt={plate.alt}
          sizes="(min-width: 64rem) 360px, 168px"
          preload
          data-hero-plate
        />
        <MedallionRing size={360} still />
      </div>
      <div className={styles.controls} />
      <figcaption className={styles.caption}>
        {plate.caption} · 1 of {plates.length}
      </figcaption>
    </figure>
  )
}
