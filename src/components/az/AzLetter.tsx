import type { AzEntry as Entry } from '@/content'

import styles from './az.module.css'
import { AzEntry } from './AzEntry'
import { DEFAULT_KINDS } from './filter'
import type { AzListEntry } from './model'

/** A letter's section of the A–Z: its capital, then its entries, numbered across the whole list. */
export function AzLetter({
  letter,
  id,
  entries,
  topicNames,
}: {
  letter: string
  id: string
  entries: readonly AzListEntry[]
  topicNames: ReadonlyMap<string, string>
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
        {entries.map(({ entry, index, preview, card }) => (
          <AzEntry
            key={index}
            entry={entry}
            topicNames={topicNames}
            hidden={!shown(entry)}
            {...(preview ? { preview } : {})}
            {...(card ? { card } : {})}
          />
        ))}
      </ul>
    </section>
  )
}
