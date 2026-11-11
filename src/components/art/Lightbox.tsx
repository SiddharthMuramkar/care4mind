'use client'

import { Dialog } from '@base-ui/react/dialog'
import Image from 'next/image'
import { type CSSProperties, type RefObject, useState } from 'react'

import type { ArtRecord } from '@/art'
import { cx } from '@/lib/cx'

import { CloseGlyph } from '../glyphs'
import styles from './Lightbox.module.css'

/** What the lightbox shows of a picture: the file, its alt and its caption, and nothing of where it came from. */
export type LightboxPicture = Pick<ArtRecord, 'src' | 'width' | 'height' | 'alt' | 'caption'>

export interface LightboxProps {
  picture: LightboxPicture
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The control that opened it, where focus goes back to as it closes. */
  returnFocus: RefObject<HTMLElement | null>
}

/**
 * A picture whole and larger, never cut to a circle, on a leaf of paper laid over the page, with
 * its caption under it (Base UI's modal Dialog). Its caption names it, or its alt where it has
 * none. It keeps focus inside while open; Escape, Close or a press outside put it away, and
 * focus goes back to what opened it. Loaded only once a visitor nears or presses a picture.
 */
export function Lightbox({ picture, open, onOpenChange, returnFocus }: LightboxProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup
          className={styles.popup}
          data-paper
          aria-label={picture.caption ? undefined : picture.alt}
          finalFocus={returnFocus}
        >
          <Dialog.Close className={styles.close}>
            <CloseGlyph className={styles.closeGlyph} />
            Close
          </Dialog.Close>
          {/* A new picture is a new figure, so its paper shows again until its own file is in. */}
          <WholePicture key={picture.src} picture={picture} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/**
 * The picture at up to half its file's width, the most that stays sharp on a 2× screen (512 px for
 * a 1024 px Plate), and smaller where the screen is. Pale paper shows behind it until its file is
 * in, then goes, since a Sticker is cut out and never covers it.
 */
function WholePicture({ picture }: { picture: LightboxPicture }) {
  const { src, width, height, alt, caption } = picture
  const [loaded, setLoaded] = useState(false)
  const shown = Math.round(width / 2)
  return (
    <figure className={styles.figure} style={{ '--whole': `${shown}px` } as CSSProperties}>
      <Image
        className={cx(styles.picture, !loaded && styles.loading)}
        src={src}
        width={shown}
        height={Math.round((shown * height) / width)}
        alt={alt}
        // Asked for as the lightbox opens, not when it nears the screen: it is already there.
        loading="eager"
        onLoad={() => setLoaded(true)}
      />
      {caption ? (
        <Dialog.Title className={styles.caption} render={<figcaption />}>
          {caption}
        </Dialog.Title>
      ) : null}
    </figure>
  )
}
