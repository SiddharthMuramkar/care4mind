'use client'

import Image, { getImageProps } from 'next/image'
import { type ReactNode, useRef, useState } from 'react'

import type { ArtRecord } from '@/art'
import { cx } from '@/lib/cx'

import { useHydrated } from '../browser'
import { ArrowGlyph } from '../glyphs'
import styles from './PlateViewer.module.css'
import { openWholeLabel } from './whole'

/** As wide as the Medallion stands: 480 px from 64rem, 360 from 48rem, and on a phone 72vw up to 300. */
const SIZES = '(min-width: 64rem) 480px, (min-width: 48rem) 360px, min(72vw, 300px)'

/**
 * The homepage's paintings: one Plate at a time as a Medallion, its caption and two buttons, which
 * are the only things that ever change it. Takes only what it shows, so that a picture's origin
 * never reaches the browser, and its `ring` ready drawn, so that the ring's paths stay out of this
 * script. With `onOpen` the Plate on screen is a button too, which hands its index and itself to
 * whatever opens it whole; `onApproach` hears a pointer or focus reach it first. The lightbox
 * stays out of this script, so its code loads only when a visitor comes near.
 */
export function PlateViewer({
  plates,
  ring,
  className,
  onOpen,
  onApproach,
}: {
  plates: readonly Pick<ArtRecord, 'id' | 'src' | 'width' | 'height' | 'alt' | 'caption'>[]
  ring: ReactNode
  className?: string
  onOpen?: (index: number, opener: HTMLElement) => void
  onApproach?: () => void
}) {
  // The caption follows the Plate asked for at once. The picture follows when its file has loaded.
  const [asked, setAsked] = useState(0)
  const [shown, setShown] = useState(0)
  const [mounted, setMounted] = useState<readonly number[]>([0])
  const loaded = useRef(new Set([0]))
  const warmed = useRef(new Set([0]))
  const hydrated = useHydrated()

  const count = plates.length
  const plate = plates[asked]
  const onScreen = plates[shown]
  if (!plate || !onScreen) return null

  /** Fetch the Plates either side, the same file each would pick, so that a press finds it ready. */
  const warm = (from: number) => {
    for (const index of [(from + 1) % count, (from - 1 + count) % count]) {
      const neighbour = plates[index]
      if (!neighbour || warmed.current.has(index)) continue
      warmed.current.add(index)
      const { src, width, height } = neighbour
      const { props } = getImageProps({ src, width, height, sizes: SIZES, alt: '' })
      const file = new window.Image()
      // Sizes first: setting the srcset is what starts the choice of file.
      file.sizes = SIZES
      file.srcset = props.srcSet ?? ''
    }
  }

  const go = (step: number) => {
    const target = (asked + step + count) % count
    setAsked(target)
    setMounted((all) => (all.includes(target) ? all : [...all, target]))
    if (loaded.current.has(target)) setShown(target)
    // The button stays hovered or focused after a press, so its own events won't come again.
    warm(target)
  }

  /** Let go of a Plate whose file failed, so that the next visit fetches it again. */
  const forget = (index: number) => {
    warmed.current.delete(index)
    setMounted((all) => all.filter((other) => other !== index))
    if (index === asked) setAsked(shown)
  }

  const warmOnApproach = {
    onPointerEnter: () => warm(asked),
    onFocus: () => warm(asked),
  }

  return (
    <figure className={cx(styles.viewer, className)}>
      <div className={styles.medallion}>
        {plates.map(
          ({ id, src, width, height, alt }, index) =>
            mounted.includes(index) && (
              <Image
                key={id}
                className={cx(styles.plate, index === shown && styles.current)}
                src={src}
                width={width}
                height={height}
                sizes={SIZES}
                alt={index === shown ? alt : ''}
                // The first Plate is the homepage's one preload, asked for ahead of every other file.
                preload={index === 0}
                loading={index === 0 ? undefined : 'eager'}
                fetchPriority={index === 0 ? 'high' : undefined}
                onLoad={() => {
                  loaded.current.add(index)
                  if (index === asked) setShown(index)
                }}
                // Not on the first Plate: with `onError`, next/image requests a server-sent file again.
                onError={index === 0 ? undefined : () => forget(index)}
                data-hero-plate
              />
            ),
        )}
        {ring}
        {onOpen ? (
          // Over the Plate on screen, which it opens. Hidden until the page can open anything.
          <button
            type="button"
            className={styles.open}
            aria-label={openWholeLabel(onScreen)}
            aria-haspopup="dialog"
            hidden={!hydrated}
            onClick={(event) => onOpen(shown, event.currentTarget)}
            onPointerEnter={onApproach}
            onFocus={onApproach}
          />
        ) : null}
      </div>
      <div
        role="group"
        aria-label="Paintings"
        className={cx(styles.controls, hydrated && styles.ready)}
      >
        <button
          type="button"
          className={cx(styles.button, styles.previous)}
          aria-label="Previous painting"
          data-ink
          onClick={() => go(-1)}
          {...warmOnApproach}
        >
          <ArrowGlyph className={styles.arrow} />
        </button>
        <button
          type="button"
          className={styles.button}
          aria-label="Next painting"
          data-ink
          onClick={() => go(1)}
          {...warmOnApproach}
        >
          <ArrowGlyph className={styles.arrow} />
        </button>
      </div>
      {/* Last in the figure, as a figcaption must be: CSS stands it under the Plate. */}
      <figcaption className={styles.caption} aria-live="polite" aria-atomic="true">
        {plate.caption} · {asked + 1} of {count}
      </figcaption>
    </figure>
  )
}
