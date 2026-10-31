import { ViewTransition } from 'react'

import { ScriptPair } from '@/components/script/ScriptPair'
import type { WorkCard } from '@/content'

import styles from './WorkTitle.module.css'

/**
 * A work's title in both scripts (ScriptPair): IAST, and its Devanagari where a page gives one.
 * The IAST flies from the work's card on the shelf into its page's heading as the page turns.
 */
export function WorkTitle({
  work,
  className,
  iastClassName,
  devanagariClassName,
}: {
  work: WorkCard
  className?: string
  iastClassName?: string
  devanagariClassName?: string
}) {
  return (
    <ScriptPair
      lang={work.lang}
      className={className}
      iast={
        <ViewTransition name={`work-title-${work.slug}`} share="morph" default="none">
          {/* Whole: a title broken over two lines can't fly. */}
          <span className={styles.whole}>{work.title}</span>
        </ViewTransition>
      }
      {...(work.term.devanagari ? { devanagari: work.term.devanagari } : {})}
      {...(iastClassName ? { iastClassName } : {})}
      {...(devanagariClassName ? { devanagariClassName } : {})}
    />
  )
}
