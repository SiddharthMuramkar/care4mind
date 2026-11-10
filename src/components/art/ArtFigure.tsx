import Image from 'next/image'

import type { ArtRecord } from '@/art'
import { cx } from '@/lib/cx'

import styles from './ArtFigure.module.css'

const WIDTH = 160

/**
 * A picture standing alone in the credits gallery, with the record's alt and only its caption:
 * the words for where it came from stay off the gallery. A circle is CSS, so the file is never cut.
 */
export function ArtFigure({ art, shape }: { art: ArtRecord; shape: 'circle' | 'square' }) {
  return (
    <figure className={styles.figure}>
      <Image
        src={art.src}
        alt={art.alt}
        width={WIDTH}
        height={shape === 'circle' ? WIDTH : Math.round((WIDTH * art.height) / art.width)}
        className={cx(styles.picture, shape === 'circle' && styles.circle)}
      />
      {art.caption ? <figcaption className={styles.caption}>{art.caption}</figcaption> : null}
    </figure>
  )
}
