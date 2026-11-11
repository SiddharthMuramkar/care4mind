'use client'

import type { ComponentProps } from 'react'

import { PlateViewer } from './PlateViewer'
import { useLightbox } from './use-lightbox'

/**
 * The homepage's Plate viewer, whose Plate on screen opens whole in the lightbox when pressed.
 * The lightbox lives here, outside the viewer, so the viewer's own script stays within its budget
 * and the lightbox's loads only when a visitor nears the Plate.
 */
export function HeroPlates({
  plates,
  ...rest
}: Omit<ComponentProps<typeof PlateViewer>, 'onOpen' | 'onApproach'>) {
  const { warm, open, lightbox } = useLightbox()
  return (
    <>
      <PlateViewer
        plates={plates}
        {...rest}
        onOpen={(index, opener) => {
          const plate = plates[index]
          if (plate) open(plate, opener)
        }}
        onApproach={warm}
      />
      {lightbox}
    </>
  )
}
