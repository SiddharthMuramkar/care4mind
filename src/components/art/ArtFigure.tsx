import Image from 'next/image'

import type { ArtRecord } from '@/art'
import { cx } from '@/lib/cx'

import styles from './ArtFigure.module.css'
import { LightboxButton } from './LightboxButton'

const WIDTH = 240

/**
 * A picture standing alone in the credits gallery, with the record's alt and only its caption:
 * the words for where it came from stay off the gallery. A circle is CSS, so the file is never cut.
 * Pressing the picture opens it whole in the lightbox, which is handed only what it shows.
 */
export function ArtFigure({ art, shape }: { art: ArtRecord; shape: 'circle' | 'square' }) {
  const { src, width, height, alt, caption } = art
  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        <Image
          src={src}
          alt={alt}
          width={WIDTH}
          height={shape === 'circle' ? WIDTH : Math.round((WIDTH * height) / width)}
          className={cx(styles.picture, shape === 'circle' && styles.circle)}
        />
        <LightboxButton picture={{ src, width, height, alt, caption }} className={styles.open} />
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  )
}
