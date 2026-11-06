import { TitleMorph } from '../PageTurn'
import { ScriptPair } from '../script'
import styles from './TitleSpellings.module.css'

/**
 * A Concept heading's two spellings: the capitalised IAST, the Devanagari beside it, set
 * through ScriptPair so each carries its language tag. A Concept card's title flies into the
 * IAST, for the Concept named by `slug`.
 */
export function TitleSpellings({
  iast,
  devanagari,
  slug,
}: {
  iast: string
  devanagari: string
  slug: string
}) {
  return (
    <ScriptPair
      className={styles.pair}
      iast={
        <TitleMorph kind="concept" slug={slug}>
          <span>{iast}</span>
        </TitleMorph>
      }
      devanagari={devanagari}
    />
  )
}
