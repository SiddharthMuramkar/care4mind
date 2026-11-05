import type { PreviewPayload } from '@/components/preview/LinkPreview'
import type { AzEntry as Entry } from '@/content'

import styles from './az.module.css'
import { AzEntry } from './AzEntry'
import { DEFAULT_KINDS } from './filter'

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
  // The server renders the plain address's list, so it paints without a flash of every entry.
  const shown = (entry: Entry) => DEFAULT_KINDS.includes(entry.kind)
  return (
    <section
      id={id}
      className={styles.section}
      data-letter
      {...(entries.some(({ entry }) => shown(entry)) ? {} : { hidden: true })}
    >
      <h3 className={styles.letterTitle}>{letter}</h3>
      <ul className={styles.entries}>
        {entries.map(({ entry, index }) => {
          const preview = previewOf(entry)
          return (
            <AzEntry
              key={index}
              entry={entry}
              topicNames={topicNames}
              hidden={!shown(entry)}
              {...(preview ? { preview } : {})}
            />
          )
        })}
      </ul>
    </section>
  )
}
