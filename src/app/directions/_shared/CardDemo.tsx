'use client'

import { useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { startTransition, useEffect, useRef, useState, ViewTransition } from 'react'
import type { MouseEvent } from 'react'

import { ConceptCard } from '@/components/ConceptCard'
import type { Concept } from '@/content'
import { capitalise } from '@/lib/text'

import styles from './CardDemo.module.css'

type Variant = 'press' | 'chroma' | 'kolam'

interface Props {
  concept: Pick<Concept, 'slug' | 'term' | 'gloss' | 'summary'> & { firstLine: string }
  variant: Variant
}

/**
 * The click demo: the card opens into a title view on the same page, using the
 * same <ViewTransition> morph the real Concept page uses on navigation.
 */
export function CardDemo({ concept, variant }: Props) {
  const [open, setOpen] = useState(false)
  const [devanagariFirst, setDevanagariFirst] = useState(false)
  const [flood, setFlood] = useState<{ x: number; y: number } | null>(null)
  const reduceMotion = useReducedMotion()
  const openButton = useRef<HTMLButtonElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (open) heading.current?.focus()
    else if (wasOpen.current) openButton.current?.focus()
    wasOpen.current = open
  }, [open])

  function show(event: MouseEvent<HTMLButtonElement>) {
    if (variant === 'chroma' && !reduceMotion) {
      const card = event.currentTarget.closest('article')?.getBoundingClientRect()
      if (card) setFlood({ x: event.clientX - card.left, y: event.clientY - card.top })
    }
    startTransition(() => setOpen(true))
  }

  if (!open) {
    return (
      <div className={styles.stage} data-variant={variant}>
        <ConceptCard
          concept={concept}
          className={styles.card}
          action={
            <m.button
              ref={openButton}
              type="button"
              className={styles.open}
              onClick={show}
              whileTap={variant === 'chroma' ? { scale: 0.96 } : undefined}
              transition={{ type: 'spring', stiffness: 520, damping: 28 }}
            >
              Open <span lang="sa-Latn">{capitalise(concept.term.iast)}</span>
            </m.button>
          }
        />
      </div>
    )
  }

  const scripts = [
    <ViewTransition key="iast" name="demo-script-iast" share="morph" default="none">
      <span lang="sa-Latn" className={styles.scriptIast}>
        {capitalise(concept.term.iast)}
      </span>
    </ViewTransition>,
    <ViewTransition key="deva" name="demo-script-deva" share="morph" default="none">
      <span lang="sa-Deva" className={styles.scriptDeva}>
        {concept.term.devanagari}
      </span>
    </ViewTransition>,
  ]

  return (
    <div className={styles.stage} data-variant={variant}>
      <section className={styles.expanded} aria-labelledby="demo-heading">
        {flood ? (
          <m.div
            aria-hidden
            className={styles.flood}
            initial={{ clipPath: `circle(0% at ${flood.x}px ${flood.y}px)` }}
            animate={{ clipPath: `circle(150% at ${flood.x}px ${flood.y}px)` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}
        <ViewTransition name={`concept-title-${concept.slug}`} share="morph" default="none">
          <h3 id="demo-heading" ref={heading} tabIndex={-1} className={styles.heading}>
            {variant === 'kolam' ? (
              <span className={styles.scripts}>
                {devanagariFirst ? [scripts[1], scripts[0]] : scripts}
              </span>
            ) : (
              <span lang="sa-Latn">{capitalise(concept.term.iast)}</span>
            )}
          </h3>
        </ViewTransition>
        {variant !== 'kolam' ? (
          <p lang="sa-Deva" className={styles.deva}>
            {concept.term.devanagari}
          </p>
        ) : null}
        <p className={styles.gloss}>{concept.gloss}</p>
        <p lang="sa-Deva" className={styles.line}>
          {concept.firstLine}
        </p>
        <div className={styles.actions}>
          {variant === 'kolam' ? (
            <button
              type="button"
              className={styles.secondary}
              aria-pressed={devanagariFirst}
              onClick={() => startTransition(() => setDevanagariFirst((value) => !value))}
            >
              Devanagari first
            </button>
          ) : null}
          <button
            type="button"
            className={styles.close}
            onClick={() => {
              setFlood(null)
              startTransition(() => setOpen(false))
            }}
          >
            Back to the card
          </button>
        </div>
      </section>
    </div>
  )
}
