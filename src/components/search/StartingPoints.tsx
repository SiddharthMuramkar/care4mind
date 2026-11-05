import Link from 'next/link'

import { turnForward } from '@/components/PageTurn'
import { home, hrefFor } from '@/content'

import styles from './StartingPoints.module.css'

/**
 * The “What's on your mind?” chips, as the homepage sets them: each everyday starting point in
 * the home record leading to its Concept. Nothing shows while their proposal flag is off,
 * which the home view settles.
 */
export async function StartingPoints() {
  const { onYourMind } = await home.get()
  if (onYourMind.length === 0) return null
  return (
    <ul className={styles.chips}>
      {onYourMind.map(({ label, concept }) => (
        <li key={label}>
          <Link
            href={hrefFor({ kind: 'concept', id: concept.slug })}
            transitionTypes={turnForward}
            className={styles.chip}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
