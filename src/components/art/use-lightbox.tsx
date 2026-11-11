'use client'

import { type ComponentType, useRef, useState } from 'react'

import type { LightboxPicture, LightboxProps } from './Lightbox'

let code: Promise<ComponentType<LightboxProps>> | undefined

/** The lightbox's own script, fetched once a visitor nears or presses a picture, never with the page. */
function load() {
  code ??= import('./Lightbox').then(
    (module) => module.Lightbox,
    (error: unknown) => {
      // Let a later press ask again, rather than keep a failed fetch.
      code = undefined
      throw error
    },
  )
  return code
}

/**
 * What a picture's opener needs: `warm` fetches the lightbox's script ahead of a press, `open`
 * shows a picture whole and remembers the control that asked, for focus to go back to, and
 * `lightbox` is the dialog to render beside the opener, nothing until the first press.
 */
export function useLightbox() {
  const [Lightbox, setLightbox] = useState<ComponentType<LightboxProps>>()
  const [picture, setPicture] = useState<LightboxPicture>()
  const [open, setOpen] = useState(false)
  const opener = useRef<HTMLElement | null>(null)

  return {
    warm: () => {
      load().catch(() => undefined)
    },
    open: (next: LightboxPicture, from: HTMLElement) => {
      opener.current = from
      load().then(
        (component) => {
          setLightbox(() => component)
          setPicture(next)
          setOpen(true)
        },
        () => undefined,
      )
    },
    lightbox:
      Lightbox && picture ? (
        <Lightbox picture={picture} open={open} onOpenChange={setOpen} returnFocus={opener} />
      ) : null,
  }
}
