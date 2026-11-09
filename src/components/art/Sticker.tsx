import Image from 'next/image'

import type { ArtRecord } from '@/art'
import { cx } from '@/lib/cx'

import styles from './Sticker.module.css'

interface StickerProps {
  art: ArtRecord
  /** The size in CSS pixels. A width with no `sizes` lists two files, 1x and 2x. */
  size: number
  className?: string
}

/** A folk-art Sticker. Always decorative: the words beside it name the thing. */
export function Sticker({ art, size, className }: StickerProps) {
  return (
    <Image
      src={art.src}
      alt=""
      width={size}
      height={Math.round((size * art.height) / art.width)}
      className={cx(styles.sticker, className)}
    />
  )
}
