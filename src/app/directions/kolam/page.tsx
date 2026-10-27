import type { Metadata } from 'next'

import { getConcept, getHomepage } from '@/content'
import { eczar } from '@/fonts/eczar'
import { literata } from '@/fonts/literata'

import { getDirection } from '../_shared/directions'
import { StyleTile } from '../_shared/StyleTile'
import { KolamHero, KolamScrollDemo, KolamWordmark } from './KolamParts'
import styles from './kolam.module.css'

export const metadata: Metadata = { title: 'Style tile: Kolam' }

export default async function KolamTile() {
  const [concept, home] = await Promise.all([getConcept('vikshepa'), getHomepage()])
  if (!concept) throw new Error('sample Concept missing')
  return (
    <StyleTile
      direction={getDirection('kolam')}
      concept={concept}
      fontClassName={`${literata.variable} ${eczar.variable}`}
      className={styles.root}
      hero={<KolamHero home={home} />}
      scrollDemo={<KolamScrollDemo />}
      wordmark={
        <>
          <KolamWordmark size="large" />
          <p className={styles.markReversed}>
            <KolamWordmark size="small" />
          </p>
        </>
      }
    />
  )
}
