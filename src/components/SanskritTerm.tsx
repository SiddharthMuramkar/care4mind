import type { SanskritName } from '@/content'
import { capitalise } from '@/lib/text'

import { cx } from '@/lib/cx'

import { ScriptPair } from './script/ScriptPair'
import styles from './SanskritTerm.module.css'

interface Props {
  term: SanskritName
  gloss?: string
  /** Show the Devanagari form beside the IAST, where the term has one. */
  devanagari?: boolean
  capitalised?: boolean
  className?: string
}

/**
 * A Sanskrit term in IAST, optionally with its Devanagari form and English
 * gloss. Each script carries its own lang tag (WCAG 3.1.2, Language of Parts).
 */
export function SanskritTerm({
  term,
  gloss,
  devanagari = true,
  capitalised = false,
  className,
}: Props) {
  return (
    <span className={cx(styles.term, className)}>
      <ScriptPair
        className={styles.pair}
        iast={capitalised ? capitalise(term.iast) : term.iast}
        devanagari={devanagari ? term.devanagari : undefined}
        devanagariClassName={styles.deva}
      />
      {gloss ? <span className={styles.gloss}>({gloss})</span> : null}
    </span>
  )
}
