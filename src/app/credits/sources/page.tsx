import type { Metadata } from 'next'

import { originLine, shipped } from '@/art'
import { ReadingPage } from '@/components/ReadingPage'
import { hrefFor } from '@/content'
import { metadataFor } from '@/lib/metadata'

import styles from './page.module.css'

const PATH = hrefFor({ page: 'credits-sources' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/** Every picture's name, origin and licence, from the registry: the one place these are written. */
export default function CreditsSourcesPage() {
  return (
    <ReadingPage path={PATH} titleId="credits-sources-title" title="Where these pictures come from">
      <ul className={styles.entries}>
        {shipped().map((picture) => (
          <li key={picture.id} className={styles.entry}>
            <p className={styles.name}>{picture.caption ?? picture.alt}</p>
            <dl className={styles.facts}>
              <dt className={styles.term}>Origin</dt>
              <dd className={styles.fact}>{originLine(picture.origin)}</dd>
              <dt className={styles.term}>Licence</dt>
              <dd className={styles.fact}>{picture.licence}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </ReadingPage>
  )
}
