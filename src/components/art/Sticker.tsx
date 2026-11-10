import Image from 'next/image'

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

/**
 * A folk-art Sticker. Always decorative: the words beside it name the thing. Lower down it stands
 * on the pale paper until its file is in. In the first screen it has none: its file usually
 * arrives before the page's script, which is all that could take the paper away.
 */
export function Sticker({ art, size, firstScreen = false, className }: StickerProps) {
  const shown = {
    src: art.src,
    width: size,
    height: Math.round((size * art.height) / art.width),
    className: cx(styles.sticker, className),
  }
  return firstScreen ? (
    <Image {...shown} alt="" loading="eager" fetchPriority="high" />
  ) : (
    <StickerImage {...shown} />
  )
}
