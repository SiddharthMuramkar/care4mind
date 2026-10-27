import type { Homepage } from '@/content'
import { cx } from '@/lib/cx'

import { kolam } from './kolam-path'
import styles from './kolam.module.css'

function Kolam({
  m,
  n,
  className,
  drawOn,
}: {
  m: number
  n: number
  className?: string
  drawOn: 'load' | 'scroll'
}) {
  const { d, dots, width, height } = kolam(m, n)
  const pad = 14
  return (
    <svg
      className={cx(styles.kolam, className)}
      viewBox={`${-pad} ${-pad} ${width + 2 * pad} ${height + 2 * pad}`}
      aria-hidden
      focusable="false"
    >
      <path
        d={d}
        pathLength={1}
        className={cx(
          styles.kolamLine,
          drawOn === 'load' ? styles.drawOnLoad : styles.drawOnScroll,
        )}
      />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2.6} className={styles.kolamDot} />
      ))}
    </svg>
  )
}

function KolamMark() {
  return <Kolam m={2} n={1} className={styles.mark} drawOn="load" />
}

export function KolamWordmark({ size }: { size: 'large' | 'small' }) {
  return (
    <span className={cx(styles.wordmark, size === 'large' && styles.wordmarkLarge)}>
      <KolamMark />
      care4mind
    </span>
  )
}

export function KolamHero({ home }: { home: Homepage }) {
  return (
    <section className={styles.hero} aria-labelledby="kolam-hero-title">
      <nav className={styles.heroNav} aria-label="Sample sections">
        <KolamWordmark size="small" />
        <ul>
          <li>Concepts</li>
          <li>Traditional texts</li>
          <li>References</li>
          <li>Questionnaires</li>
        </ul>
      </nav>
      <div className={styles.heroGrid}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>A portal for Indian psychology</p>
          <h1 id="kolam-hero-title" className={styles.heroTitle}>
            <span lang="sa-Deva" className={styles.heroDeva}>
              {home.shloka.devanagari}
            </span>
            <span lang="sa-Latn" className={styles.heroIast}>
              {home.shloka.iast}
            </span>
          </h1>
          <p className={styles.heroTranslation}>{home.shloka.translation}</p>
          <p className={styles.heroIntro}>{home.intro}</p>
          <p className={styles.heroCta}>
            <a href="#card" className={styles.ctaPrimary}>
              Try the Concept card
            </a>
            <a href="#type" className={styles.ctaLink}>
              See the type
            </a>
          </p>
        </div>
        <Kolam m={5} n={4} className={styles.heroKolam} drawOn="load" />
      </div>
    </section>
  )
}

export function KolamScrollDemo() {
  return (
    <figure className={styles.scrollDemo}>
      <Kolam m={7} n={4} drawOn="scroll" />
      <figcaption className={styles.caption}>
        One line, never lifted, passing between every dot: a picture of Concepts, texts and
        References joined into one body of knowledge.
      </figcaption>
    </figure>
  )
}
