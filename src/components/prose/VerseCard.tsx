import type { VerseView } from '@/content'
import { cx } from '@/lib/cx'

import { Shloka } from './Shloka'
import { CopyVerse } from './CopyVerse'
import styles from './Prose.module.css'

/** A verse as plain text to copy: its Devanagari, transliteration, translation and locator. */
export function verseAsText(verse: VerseView): string {
  const translation = verse.translation
    ? `${verse.translation}${verse.translationSource ? ` (${verse.translationSource})` : ''}`
    : ''
  return [verse.devanagari.join('\n'), verse.transliteration.join('\n'), translation, verse.source]
    .filter(Boolean)
    .join('\n\n')
}

/**
 * A verse card: the verse set like a manuscript, a chip naming its work and locator that leads to
 * the passage on the work's page, and "Copy verse".
 */
export function VerseCard({ verse, className }: { verse: VerseView; className?: string }) {
  return (
    <div className={cx(styles.verseCard, className)}>
      <Shloka verse={verse} className={styles.verse} />
      <CopyVerse text={verseAsText(verse)} source={verse.source} lang={verse.work.lang} />
    </div>
  )
}
