import { ViewTransition } from 'react'

import { ScriptPair } from '../script/ScriptPair'
import styles from './TitleSpellings.module.css'

/**
 * A Concept heading's two spellings: the capitalised IAST, the Devanagari beside it, set
 * through ScriptPair so each carries its language tag. A Concept card's title flies into the
 * IAST (`name`).
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
  return (
    <ScriptPair
      className={styles.pair}
      iast={
        <ViewTransition name={name} share="morph" default="none">
          <span>{iast}</span>
        </ViewTransition>
      }
      devanagari={devanagari}
    />
  )
}
