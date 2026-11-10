'use client'

import Image from 'next/image'
import { useState } from 'react'

import { cx } from '@/lib/cx'

import styles from './Sticker.module.css'

/**
 * A Sticker's file, lazily loaded, on the pale paper until it is in. A Sticker is cut out, so
 * unlike a Medallion's picture it never covers the paper: the paper has to go once the file is in.
 * Takes only what it shows, so that a picture's origin never reaches the browser.
 */
export function StickerImage({
  src,
  width,
  height,
  className,
}: {
  src: string
  width: number
  height: number
  className?: string
}) {
  const [loaded, setLoaded] = useState(false)
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      className={cx(className, !loaded && styles.loading)}
      // next/image calls this for a file that loaded before the page's script started, too.
      onLoad={() => setLoaded(true)}
    />
  )
}
