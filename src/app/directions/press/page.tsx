import type { Metadata } from 'next'

import { getConcept, getHomepage } from '@/content'
import { playfair } from '@/fonts/playfair'
import { tiroDevanagariSanskrit } from '@/fonts/tiro-devanagari-sanskrit'

import { getDirection } from '../_shared/directions'
import { StyleTile } from '../_shared/StyleTile'
import { Fleuron, PressHero, PressScrollDemo, PressWordmark } from './PressParts'
import styles from './press.module.css'

export const metadata: Metadata = { title: 'Style tile: Press' }

export default async function PressTile() {
  const [concept, home] = await Promise.all([getConcept('vikshepa'), getHomepage()])
  if (!concept) throw new Error('sample Concept missing')
  return (
    <StyleTile
      direction={getDirection('press')}
      concept={concept}
      fontClassName={`${playfair.variable} ${tiroDevanagariSanskrit.variable}`}
      className={styles.root}
      hero={<PressHero home={home} />}
      scrollDemo={<PressScrollDemo concept={concept} />}
      wordmark={
        <>
          <PressWordmark size="large" />
          <p className={styles.markOnPaper}>
            <PressWordmark size="small" />
            <Fleuron className={styles.markFleuron} />
          </p>
        </>
      }
    />
  )
}
