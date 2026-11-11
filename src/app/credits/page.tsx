import type { Metadata } from 'next'
import Link from 'next/link'

import { shipped, type ArtFamily } from '@/art'
import { ArtFigure } from '@/components/art'
import { turnForward } from '@/components/PageTurn'
import { ReadingPage } from '@/components/ReadingPage'
import { hrefFor } from '@/content'
import { metadataFor } from '@/lib/metadata'

import reading from '@/styles/reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'credits' })

/** The gallery's groups, in the order they stand on the page. */
const FAMILIES: readonly { family: ArtFamily; title: string; shape: 'circle' | 'square' }[] = [
  { family: 'emblem', title: 'Emblem', shape: 'square' },
  { family: 'sticker', title: 'Stickers', shape: 'square' },
  { family: 'plate', title: 'Plates', shape: 'circle' },
]

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * Every picture this build ships, by family, each with its caption and nothing else. The words
 * for where a picture came from stay on the plain list that the one link at the end leads to.
 */
export default function CreditsPage() {
  const pictures = shipped()
  return (
    <ReadingPage path={PATH} titleId="credits-title" title="Picture credits" width="library">
      {FAMILIES.map(({ family, title, shape }) => {
        const members = pictures.filter((picture) => picture.family === family)
        if (members.length === 0) return null
        return (
          <section key={family} className={reading.section} aria-labelledby={`${family}-title`}>
            <h2 id={`${family}-title`} className={reading.sectionTitle}>
              {title}
            </h2>
            <div className={styles.galleryFrame}>
              <div className={styles.gallery}>
                {members.map((picture) => (
                  <ArtFigure key={picture.id} art={picture} shape={shape} />
                ))}
              </div>
            </div>
          </section>
        )
      })}
      <p className={styles.sources}>
        <Link href={hrefFor({ page: 'credits-sources' })} transitionTypes={turnForward}>
          Where these pictures come from
        </Link>
      </p>
    </ReadingPage>
  )
}
