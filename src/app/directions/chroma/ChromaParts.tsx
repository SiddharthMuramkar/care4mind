import type { Homepage } from '@/content'
import { cx } from '@/lib/cx'

import styles from './chroma.module.css'

export function ChromaWordmark({ size }: { size: 'large' | 'small' }) {
  return (
    <span className={cx(styles.wordmark, size === 'large' && styles.wordmarkLarge)}>
      CARE<span className={styles.four}>4</span>MIND
    </span>
  )
}

/** One repeat of a block-print border: a stepped diamond between two lotus marks. */
function BlockPrint({ id, fill, ground }: { id: string; fill: string; ground: string }) {
  return (
    <svg className={styles.band} aria-hidden focusable="false" preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="96" height="64" patternUnits="userSpaceOnUse">
          <rect width="96" height="64" fill={ground} />
          <path
            d="M48 6 62 20 56 20 70 32 56 44 62 44 48 58 34 44 40 44 26 32 40 20 34 20Z"
            fill={fill}
          />
          <circle cx="48" cy="32" r="5" fill={ground} />
          <path
            d="M0 32c6-10 14-12 20-12-2 6-8 10-20 12Zm0 0c6 10 14 12 20 12-2-6-8-10-20-12Z"
            fill={fill}
          />
          <path
            d="M96 32c-6-10-14-12-20-12 2 6 8 10 20 12Zm0 0c-6 10-14 12-20 12 2-6 8-10 20-12Z"
            fill={fill}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export function ChromaHero({ home }: { home: Homepage }) {
  return (
    <section className={styles.hero} aria-labelledby="chroma-hero-title">
      <nav className={styles.heroNav} aria-label="Sample sections">
        <ChromaWordmark size="small" />
        <ul>
          <li>Concepts</li>
          <li>Texts</li>
          <li>References</li>
          <li>Questionnaires</li>
        </ul>
      </nav>
      <div className={styles.mosaic}>
        <div className={styles.blockPink}>
          <h1 id="chroma-hero-title" className={styles.heroTitle}>
            <span lang="sa-Deva" className={styles.heroDeva}>
              {home.shloka.devanagari}
            </span>
            <span lang="sa-Latn" className={styles.heroIast}>
              {home.shloka.iast}
            </span>
          </h1>
        </div>
        <div className={styles.blockMarigold}>
          <p className={styles.heroTranslation}>{home.shloka.translation}</p>
        </div>
        <div className={styles.blockPeacock} aria-hidden>
          <span className={styles.moon} />
          <span className={styles.moonSmall} />
        </div>
        <div className={styles.blockPaper}>
          <p className={styles.heroIntro}>{home.intro}</p>
          <p className={styles.heroCta}>
            <a href="#card" className={styles.ctaPrimary}>
              Try the Concept card
            </a>
            <a href="#type" className={styles.ctaSecondary}>
              See the type
            </a>
          </p>
        </div>
        <div className={styles.blockLeaf} aria-hidden>
          <BlockPrint id="hero-print" fill="#ffb300" ground="#4c9a2a" />
        </div>
      </div>
    </section>
  )
}

export function ChromaScrollDemo() {
  return (
    <div className={styles.scrollDemo}>
      <div className={cx(styles.bandRow, styles.bandLeft)}>
        <BlockPrint id="band-a" fill="#ffb300" ground="#c2185b" />
      </div>
      <div className={cx(styles.bandRow, styles.bandRight)}>
        <BlockPrint id="band-b" fill="#fff6e6" ground="#00796b" />
      </div>
      <div className={cx(styles.bandRow, styles.bandLeft)}>
        <BlockPrint id="band-c" fill="#24123d" ground="#ffb300" />
      </div>
    </div>
  )
}
