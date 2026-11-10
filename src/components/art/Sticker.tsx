import type { ArtRecord } from '@/art'
import { cx } from '@/lib/cx'

import styles from './Sticker.module.css'
import { StickerImage } from './StickerImage'

interface StickerProps {
  art: ArtRecord
  /** The size in CSS pixels. A width with no `sizes` lists two files, 1x and 2x. */
  size: number
  /** In the first screen, so it loads at once and ahead of the rest, there when the text paints. */
  firstScreen?: boolean
  className?: string
}

/** A folk-art Sticker. Always decorative: the words beside it name the thing. */
export function Sticker({ art, size, firstScreen, className }: StickerProps) {
  return (
    <StickerImage
      src={art.src}
      width={size}
      height={Math.round((size * art.height) / art.width)}
      firstScreen={firstScreen}
      className={cx(styles.sticker, className)}
    />
  )
}
