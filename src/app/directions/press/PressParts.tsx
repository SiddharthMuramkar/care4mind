import type { Concept, Homepage } from '@/content'
import { cx } from '@/lib/cx'
import { toDevanagariDigits } from '@/lib/text'

import styles from './press.module.css'

export function PressWordmark({ size }: { size: 'large' | 'small' }) {
  return (
    <span className={cx(styles.wordmark, size === 'large' && styles.wordmarkLarge)}>
      Care<span className={styles.four}>4</span>Mind
    </span>
  )
}

/** A lotus-petal printer's ornament, drawn as line art. */
export function Fleuron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 40" aria-hidden focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M80 4c7 9 7 21 0 32-7-11-7-23 0-32Z" />
        <path d="M80 36c-9-8-20-11-31-9 8-8 22-7 31 9Z" />
        <path d="M80 36c9-8 20-11 31-9-8-8-22-7-31 9Z" />
        <path d="M2 30h40M118 30h40" />
        <circle cx="80" cy="18" r="2.2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}

export function PressHero({ home }: { home: Homepage }) {
  return (
    <section className={styles.hero} aria-labelledby="press-hero-title">
      <nav className={styles.heroNav} aria-label="Sample sections">
        <PressWordmark size="small" />
        <ul>
          <li>Concepts</li>
          <li>Traditional texts</li>
          <li>References</li>
          <li>Questionnaires</li>
        </ul>
      </nav>
      <div className={styles.folio}>
        <span className={styles.corner} data-corner="tl" aria-hidden />
        <span className={styles.corner} data-corner="tr" aria-hidden />
        <span className={styles.corner} data-corner="bl" aria-hidden />
        <span className={styles.corner} data-corner="br" aria-hidden />
        <p className={styles.kicker}>A portal for Indian psychology</p>
        <h1 id="press-hero-title" className={styles.heroTitle}>
          <span lang="sa-Deva" className={styles.heroDeva}>
            {home.shloka.devanagari}
          </span>
          <span lang="sa-Latn" className={styles.heroIast}>
            {home.shloka.iast}
          </span>
        </h1>
        <p className={styles.heroTranslation}>{home.shloka.translation}</p>
        <Fleuron className={styles.heroFleuron} />
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
    </section>
  )
}

export function PressScrollDemo({ concept }: { concept: Concept }) {
  const shloka = concept.shlokas[0]
  if (!shloka) return null
  return (
    <div className={styles.scrollDemo}>
      {shloka.devanagari.map((line, index) => (
        <div key={index} className={styles.scrollPage}>
          <span className={styles.rule} aria-hidden />
          <p lang="sa-Deva" className={styles.scrollLine}>
            {line}
          </p>
          <p lang="sa-Latn" className={styles.scrollTranslit}>
            {shloka.transliteration[index]}
          </p>
          <span className={styles.rule} aria-hidden />
          <p className={styles.folioNumber}>
            <span lang="sa-Deva">{toDevanagariDigits(String(index + 1))}</span>
          </p>
        </div>
      ))}
    </div>
  )
}
