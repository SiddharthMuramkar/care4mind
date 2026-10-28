'use client'

import { PreviewCard } from '@base-ui/react/preview-card'

import type { PreviewPayload } from './LinkPreview'
import styles from './PreviewCard.module.css'
import type { PreviewParts } from './store'

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

/**
 * The page's one preview card. It opens beside the link that asked for it, never over it, so
 * the focused link stays in view (WCAG 2.4.11); Escape closes it, and the pointer can move onto
 * it (WCAG 1.4.13). Base UI keeps it out of the tab order: everything on it is on the link's page.
 */
function Card() {
  return (
    <PreviewCard.Root handle={handle}>
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
