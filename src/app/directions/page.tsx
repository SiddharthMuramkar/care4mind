import type { Metadata } from 'next'
import Link from 'next/link'

import { directions } from './_shared/directions'
import styles from './_shared/index.module.css'

export const metadata: Metadata = { title: 'Design directions' }

export default function DirectionsIndex() {
  return (
    <main id="main" className={styles.page}>
      <p className={styles.kicker}>Care4Mind rebuild · Design direction</p>
      <h1 className={styles.title}>Three directions</h1>
      <p className={styles.lede}>
        Each one is a style tile: a palette, a pair of typefaces, a wordmark, imagery and a way of
        moving, shown on the real Vikṣepa Concept. Pick one, or a blend of parts.
      </p>
      <ol className={styles.list}>
        {directions.map((direction, index) => (
          <li key={direction.slug} className={styles.item}>
            <Link href={`/directions/${direction.slug}`} className={styles.link}>
              <span className={styles.number}>{index + 1}</span>
              <span className={styles.name}>{direction.name}</span>
              <span className={styles.tone}>{direction.tone}</span>
              <span className={styles.pitch}>{direction.pitch}</span>
              <span className={styles.swatchRow} aria-hidden>
                {(['ground', 'surface', 'accent', 'highlight'] as const).map((token) => (
                  <span
                    key={token}
                    className={styles.chip}
                    style={{ background: direction.palette[token] }}
                  />
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  )
}
