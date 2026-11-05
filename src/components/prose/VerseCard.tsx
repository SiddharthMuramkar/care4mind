import type { VerseView } from '@/content'
import { cx } from '@/lib/cx'

import { FrameCorners } from '../Folio'
import { Shloka } from '../Shloka'
import { CopyVerse } from './CopyVerse'
import styles from './Prose.module.css'
import { verseAsText } from './verse-text'

/**
 * A verse card: the verse set like a manuscript, a chip naming its work and locator that leads to
 * the passage on the work's page, and "Copy verse". With `foldOriginal` the translation leads
 * and the original sits behind a disclosure on a narrow screen.
 */
export function VerseCard({
  verse,
  className,
  foldOriginal = false,
}: {
  verse: VerseView
  className?: string
  foldOriginal?: boolean
}) {
  return (
    <div className={cx(styles.verseCard, className)}>
      <FrameCorners />
      <Shloka verse={verse} className={styles.verse} foldOriginal={foldOriginal} />
      <CopyVerse text={verseAsText(verse)} source={verse.source} lang={verse.work.lang} />
    </div>
  )
}
