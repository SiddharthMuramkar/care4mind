'use client'

import { PreviewCard } from '@base-ui/react/preview-card'
import { Tooltip } from '@base-ui/react/tooltip'
import { useEffect } from 'react'

import { TopicChip } from '@/components/TopicChip'
import { readingTimeWords } from '@/lib/text'

import type { HoverLabelPayload } from './HoverLabel'
import type { PreviewPayload } from './LinkPreview'
import styles from './PreviewCard.module.css'
import type { PreviewParts } from './store'

export { OPEN_DELAY } from './delays'

const handle = PreviewCard.createHandle<PreviewPayload>()
const labelHandle = Tooltip.createHandle<HoverLabelPayload>()

const KINDS: Record<PreviewPayload['kind'], string> = {
  concept: 'Concept',
  glossary: 'Glossary',
  reference: 'Reference',
  passage: 'Verse',
}

/** A slip of paper with the link's name, its Devanagari and gloss, and a line from the content. */
function Slip({ payload }: { payload: PreviewPayload }) {
  const { kind, name, lang, devanagari, gloss, topic, readingMinutes, text } = payload
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
      {topic || readingMinutes !== undefined ? (
        <p className={styles.meta}>
          {topic ? <TopicChip topic={topic} /> : null}
          {readingMinutes !== undefined ? <span>{readingTimeWords(readingMinutes)}</span> : null}
        </p>
      ) : null}
      {text ? <p className={styles.text}>{text}</p> : null}
    </>
  )
}

/** When a link was last pressed: following one turns the page, which a card opening would cut short. */
let pressedAt = -Infinity
const PRESS_QUIET = 1000

/** A card about to open while a page turns, or just after a press that may start one, stays shut. */
function onOpenChange(open: boolean, details: { cancel(): void }) {
  const turning = Boolean((document as { activeViewTransition?: unknown }).activeViewTransition)
  if (open && (turning || performance.now() - pressedAt < PRESS_QUIET)) details.cancel()
}

/** Clears the sticky header (4rem), so a label can never lie over its controls (WCAG 2.4.11). */
const LABEL_MARGINS = { top: 72, right: 16, bottom: 16, left: 16 }
/** The book lifts 8 px under the pointer: the label stands clear of it. */
const LABEL_OFFSET = 18

/**
 * The page's one hover label. It stands above its item and slides to stay on screen, rather than
 * flipping a whole book's height away. Escape closes it and the pointer can move onto it (WCAG
 * 1.4.13); moving from item to item, it follows at once.
 */
function Label() {
  return (
    <Tooltip.Root handle={labelHandle} onOpenChange={onOpenChange}>
      {({ payload }) => (
        <Tooltip.Portal>
          <Tooltip.Positioner
            className={styles.positioner}
            side="top"
            sideOffset={LABEL_OFFSET}
            collisionPadding={LABEL_MARGINS}
            collisionAvoidance={{ side: 'shift', align: 'shift', fallbackAxisSide: 'none' }}
          >
            <Tooltip.Popup
              className={payload?.className}
              data-tone={payload?.tone}
              data-hover-label
            >
              <Tooltip.Arrow data-stem />
              {payload?.content}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      )}
    </Tooltip.Root>
  )
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
    <>
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
      <Label />
    </>
  )
}

export const parts: PreviewParts = {
  Card,
  Trigger: PreviewCard.Trigger,
  handle,
  label: { Trigger: Tooltip.Trigger, handle: labelHandle },
}
