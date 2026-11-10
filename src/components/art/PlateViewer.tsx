'use client'

import Image, { getImageProps } from 'next/image'
import { type ReactNode, useRef, useState } from 'react'

import type { ArtRecord } from '@/art'
import { cx } from '@/lib/cx'

import { useHydrated } from '../browser'
import { ArrowGlyph } from '../glyphs'
import styles from './PlateViewer.module.css'

const SIZES = '(min-width: 64rem) 360px, 168px'

/**
 * The homepage's paintings: one Plate at a time as a Medallion, its caption and two buttons, which
 * are the only things that ever change it. Takes only what it shows, so that a picture's origin
 * never reaches the browser, and its `ring` ready drawn, so that the ring's paths stay out of this
 * script.
 */
export function PlateViewer({
  plates,
  ring,
  className,
}: {
  plates: readonly Pick<ArtRecord, 'id' | 'src' | 'width' | 'height' | 'alt' | 'caption'>[]
  ring: ReactNode
  className?: string
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
  if (!plate) return null

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
                preload={index === 0}
                loading={index === 0 ? undefined : 'eager'}
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
