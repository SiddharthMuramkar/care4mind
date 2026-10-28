'use client'

import { PreviewCard } from '@base-ui/react/preview-card'
import { useEffect } from 'react'

import type { PreviewPayload } from './LinkPreview'
import styles from './PreviewCard.module.css'
import type { PreviewParts } from './store'

export { OPEN_DELAY } from './delays'

const handle = PreviewCard.createHandle<PreviewPayload>()

const KINDS: Record<PreviewPayload['kind'], string> = {
  concept: 'Concept',
  glossary: 'Glossary',
  reference: 'Reference',
  passage: 'Verse',
}

/** A slip of paper with the link's name, its Devanagari and gloss, and a line from the content. */
function Slip({ payload }: { payload: PreviewPayload }) {
  const { kind, name, lang, devanagari, gloss, text } = payload
  return (
    <>
      <p className={styles.kind}>{KINDS[kind]}</p>
      <p className={styles.name}>
        <span lang={lang}>{name}</span>
        {devanagari ? (
          <span lang="sa-Deva" className={styles.deva}>
            {devanagari}
          </span>
        ) : null}
      </p>
      {gloss ? <p className={styles.gloss}>{gloss}</p> : null}
      {text ? <p className={styles.text}>{text}</p> : null}
    </>
  )
}

/** When a link was last pressed: following one turns the page, which a card opening would cut short. */
let pressedAt = -Infinity
const PRESS_QUIET = 1000

/** A card about to open while a page turns, or just after a press that may start one, stays shut. */
function onOpenChange(open: boolean, details: PreviewCard.Root.ChangeEventDetails) {
  const turning = Boolean((document as { activeViewTransition?: unknown }).activeViewTransition)
  if (open && (turning || performance.now() - pressedAt < PRESS_QUIET)) details.cancel()
}

/**
 * The page's one preview card. It opens beside the link that asked for it, never over it, so
 * the focused link stays in view (WCAG 2.4.11); Escape closes it, and the pointer can move onto
 * it (WCAG 1.4.13). Base UI keeps it out of the tab order: everything on it is on the link's page.
 */
function Card() {
  useEffect(() => {
    const press = () => (pressedAt = performance.now())
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') press()
    }
    document.addEventListener('pointerdown', press, { capture: true, passive: true })
    document.addEventListener('keydown', key, { capture: true, passive: true })
    return () => {
      document.removeEventListener('pointerdown', press, { capture: true })
      document.removeEventListener('keydown', key, { capture: true })
    }
  }, [])
  return (
    <PreviewCard.Root handle={handle} onOpenChange={onOpenChange}>
      {({ payload }) => (
        <PreviewCard.Portal>
          <PreviewCard.Positioner
            className={styles.positioner}
            side="bottom"
            align="start"
            sideOffset={10}
            collisionPadding={16}
          >
            <PreviewCard.Popup className={styles.popup}>
              {payload ? <Slip payload={payload} /> : null}
            </PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      )}
    </PreviewCard.Root>
  )
}

export const parts: PreviewParts = { Card, Trigger: PreviewCard.Trigger, handle }
