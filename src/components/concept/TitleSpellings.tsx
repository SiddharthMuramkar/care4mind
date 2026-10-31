'use client'

import { use, useDeferredValue, useState, ViewTransition } from 'react'

import { DevanagariFirst } from '../ScriptChoice'
import { ScriptPair } from '../script'
import styles from './TitleSpellings.module.css'

/**
 * A Concept heading's two spellings (D07): the capitalised IAST, the Devanagari beneath it, set
 * through ScriptPair so each carries its language tag. The page's "Devanagari first" switch puts
 * the Devanagari at the head instead, and the two trade places through a view transition; a
 * Concept card's title still flies into the IAST (`name`).
 */
export function TitleSpellings({
  iast,
  devanagari,
  name,
}: {
  iast: string
  devanagari: string
  name: string
}) {
  const devanagariFirst = useDeferredValue(use(DevanagariFirst)[0])
  // Once the switch has been used, a spelling's flight is a swap, not a card's morph.
  const [swapped, setSwapped] = useState(false)
  if (devanagariFirst && !swapped) setSwapped(true)
  const swap = (leads: boolean) => (leads ? 'script-swap script-lead' : 'script-swap script-follow')

  // Each spelling is named, so that when the two change places each flies to its new spot.
  const latin = (
    <ViewTransition
      name={name}
      share={swapped ? swap(!devanagariFirst) : 'morph'}
      update={swap(!devanagariFirst)}
      default="none"
    >
      <span>{iast}</span>
    </ViewTransition>
  )
  const deva = (
    <ViewTransition
      name={`${name}-devanagari`}
      share={swap(devanagariFirst)}
      update={swap(devanagariFirst)}
      default="none"
    >
      <span>{devanagari}</span>
    </ViewTransition>
  )

  if (!devanagariFirst) {
    return <ScriptPair className={styles.pair} iast={latin} devanagari={deva} />
  }
  // The switch reorders what is read as well as what is seen: the chosen script comes first.
  return (
    <span className={styles.pair}>
      <span lang="sa-Deva">{deva}</span> <span lang="sa-Latn">{latin}</span>
    </span>
  )
}
