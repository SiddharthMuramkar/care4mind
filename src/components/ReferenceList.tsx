'use client'

import { Accordion } from '@base-ui/react/accordion'

import type { Reference } from '@/content'

import { Citation } from './Citation'
import styles from './ReferenceList.module.css'

/**
 * A Concept's References, folded away so they don't interrupt reading. The
 * panel stays in the page while closed (hidden="until-found"), so the
 * browser's find-in-page still reaches every entry.
 */
export function ReferenceList({ references }: { references: readonly Reference[] }) {
  return (
    <Accordion.Root className={styles.root} hiddenUntilFound>
      <Accordion.Item value="references" className={styles.item}>
        <Accordion.Header className={styles.header}>
          <Accordion.Trigger className={styles.trigger}>
            <span>References</span>
            <span className={styles.count}>({references.length})</span>
            <span className={styles.icon} aria-hidden />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className={styles.panel}>
          <ol className={styles.list}>
            {references.map((reference) => (
              <li key={reference.id} id={`ref-${reference.id}`}>
                <Citation reference={reference} />
              </li>
            ))}
          </ol>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}
