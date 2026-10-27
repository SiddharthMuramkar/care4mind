import type { Metadata } from 'next'

import { getConcept, getHomepage } from '@/content'
import { anekDevanagari } from '@/fonts/anek-devanagari'
import { anekLatin } from '@/fonts/anek-latin'

import { getDirection } from '../_shared/directions'
import { StyleTile } from '../_shared/StyleTile'
import { ChromaHero, ChromaScrollDemo, ChromaWordmark } from './ChromaParts'
import styles from './chroma.module.css'

export const metadata: Metadata = { title: 'Style tile: Chroma' }

export default async function ChromaTile() {
  const [concept, home] = await Promise.all([getConcept('vikshepa'), getHomepage()])
  if (!concept) throw new Error('sample Concept missing')
  return (
    <StyleTile
      direction={getDirection('chroma')}
      concept={concept}
      fontClassName={`${anekLatin.variable} ${anekDevanagari.variable}`}
      className={styles.root}
      hero={<ChromaHero home={home} />}
      scrollDemo={<ChromaScrollDemo />}
      wordmark={
        <>
          <ChromaWordmark size="large" />
          <p className={styles.markReversed}>
            <ChromaWordmark size="small" />
          </p>
        </>
      }
    />
  )
}
