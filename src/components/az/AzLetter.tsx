import type { PreviewPayload } from '@/components/preview'
import type { AzEntry as Entry } from '@/content'

import styles from './az.module.css'
import { AzEntry } from './AzEntry'

/** A letter's section of the A–Z: its capital, then its entries, numbered across the whole list. */
export function AzLetter({
  letter,
  id,
  entries,
  topicNames,
  previewOf,
}: {
  letter: string
  id: string
  entries: readonly { entry: Entry; index: number }[]
  topicNames: ReadonlyMap<string, string>
  previewOf: (entry: Entry) => PreviewPayload | undefined
}) {
  return (
    <section id={id} className={styles.section} data-letter>
      <h3 className={styles.letterTitle}>{letter}</h3>
      <ul className={styles.entries}>
        {entries.map(({ entry, index }) => {
          const preview = previewOf(entry)
          return (
            <AzEntry
              key={index}
              entry={entry}
              topicNames={topicNames}
              {...(preview ? { preview } : {})}
            />
          )
        })}
      </ul>
    </section>
  )
}
