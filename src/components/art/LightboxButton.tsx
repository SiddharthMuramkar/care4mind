'use client'

import { useHydrated } from '../browser'
import type { LightboxPicture } from './Lightbox'
import { useLightbox } from './use-lightbox'
import { openWholeLabel } from './whole'

/**
 * A button laid over a picture that opens it whole in the lightbox. It shows only its focus ring
 * and a magnifier pointer, and stays hidden until the page can open anything. Takes only what the
 * lightbox shows, so that a picture's origin never reaches the browser.
 */
export function LightboxButton({
  picture,
  className,
}: {
  picture: LightboxPicture
  className?: string
}) {
  const hydrated = useHydrated()
  const { warm, open, lightbox } = useLightbox()
  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={openWholeLabel(picture)}
        aria-haspopup="dialog"
        hidden={!hydrated}
        onClick={(event) => open(picture, event.currentTarget)}
        onPointerEnter={warm}
        onFocus={warm}
      />
      {lightbox}
    </>
  )
}
