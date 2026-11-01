import type { VerseView } from '@/content'
import { cx } from '@/lib/cx'

import { Shloka } from '../Shloka'
import { CopyVerse } from './CopyVerse'
import styles from './Prose.module.css'
import { verseAsText } from './verse-text'

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
