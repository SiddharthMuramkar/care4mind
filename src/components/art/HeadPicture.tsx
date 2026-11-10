import type { ArtRecord } from '@/art'

import { Medallion } from './Medallion'
import { Sticker } from './Sticker'

/**
 * The one picture above a page's title: a Plate as a Medallion, anything else as a Sticker.
 * Decorative, since the title beneath it names the page. The page narrows it on a phone through
 * `className`, with `max-width` and `height: auto`, which suits both shapes; `phoneSize` says what
 * that width is, so a Medallion can draw its ring for it. It is always in the first screen.
 */
export function HeadPicture({
  art,
  size,
  phoneSize,
  className,
}: {
  art: ArtRecord
  size: number
  phoneSize: number
  className?: string
}) {
  const shown = { art, size, firstScreen: true, className }
  return art.family === 'plate' ? (
    <Medallion {...shown} phoneSize={phoneSize} />
  ) : (
    <Sticker {...shown} />
  )
}
