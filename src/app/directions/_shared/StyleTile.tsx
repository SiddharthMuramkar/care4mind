import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Concept } from '@/content'
import { contrastRatio } from '@/lib/contrast'
import { cx } from '@/lib/cx'

import { CardDemo } from './CardDemo'
import { type Direction, paletteStyle } from './directions'
import styles from './StyleTile.module.css'

interface Props {
  direction: Direction
  concept: Concept
  /** The font variable classes for this direction, from next/font. */
  fontClassName: string
  /** The direction's own root class, which maps its fonts and flourishes. */
  className: string | undefined
  hero: ReactNode
  wordmark: ReactNode
  scrollDemo: ReactNode
}

const SWATCHES = [
  { label: 'Page', background: 'ground', foreground: 'ink', use: 'Text on the page' },
  { label: 'Quiet text', background: 'ground', foreground: 'ink-muted', use: 'Captions, sources' },
  { label: 'Link', background: 'ground', foreground: 'link', use: 'Links on the page' },
  { label: 'Card', background: 'surface', foreground: 'surface-ink', use: 'Text on cards' },
  { label: 'Action', background: 'accent', foreground: 'accent-ink', use: 'Buttons' },
  {
    label: 'Highlight',
    background: 'highlight',
    foreground: 'highlight-ink',
    use: 'Badges, selection',
  },
] as const

const TYPE_SCALE = [
  { name: 'Display', size: 'clamp(3rem, 9vw, 5.5rem)' },
  { name: 'Heading 1', size: 'clamp(2.25rem, 6vw, 3.25rem)' },
  { name: 'Heading 2', size: '1.875rem' },
  { name: 'Heading 3', size: '1.375rem' },
  { name: 'Lead', size: '1.25rem' },
  { name: 'Body', size: '1.0625rem' },
] as const

function ratio(
  direction: Direction,
  foreground: keyof Direction['palette'],
  background: keyof Direction['palette'],
) {
  return contrastRatio(direction.palette[foreground], direction.palette[background]).toFixed(1)
}

export function StyleTile({
  direction,
  concept,
  fontClassName,
  className,
  hero,
  wordmark,
  scrollDemo,
}: Props) {
  const firstShloka = concept.shlokas[0]
  const intro = concept.sections[0]?.blocks[0]
  return (
    <div
      className={cx(fontClassName, styles.tile, className)}
      style={paletteStyle(direction.palette)}
      data-direction={direction.slug}
    >
      <header className={styles.bar}>
        <Link href="/directions" className={styles.back}>
          All directions
        </Link>
        <p className={styles.badge}>
          Style tile · {direction.name} · {direction.tone}
        </p>
      </header>

      <main id="main">
        {hero}

        <div className={styles.sections}>
          <section className={styles.section} aria-labelledby="idea">
            <h2 id="idea" className={styles.sectionTitle}>
              The idea
            </h2>
            <p className={styles.pitch}>{direction.pitch}</p>
          </section>

          <section className={styles.section} aria-labelledby="palette">
            <h2 id="palette" className={styles.sectionTitle}>
              Palette
            </h2>
            <p className={styles.note}>
              Every text colour meets WCAG 2.2 AA (4.5:1 or more) on the colour it sits on. The
              ratio is shown on each swatch.
            </p>
            <ul className={styles.swatches}>
              {SWATCHES.map((swatch) => (
                <li
                  key={swatch.label}
                  className={styles.swatch}
                  style={{
                    background: direction.palette[swatch.background],
                    color: direction.palette[swatch.foreground],
                  }}
                >
                  <span className={styles.swatchSample} aria-hidden>
                    Aa
                  </span>
                  <span className={styles.swatchLabel}>{swatch.label}</span>
                  <span className={styles.swatchMeta}>
                    {direction.palette[swatch.foreground]} on {direction.palette[swatch.background]}
                  </span>
                  <span className={styles.swatchMeta}>
                    {ratio(direction, swatch.foreground, swatch.background)}:1 · {swatch.use}
                  </span>
                </li>
              ))}
              {direction.decorative.map((colour) => (
                <li
                  key={colour.name}
                  className={cx(styles.swatch, styles.decorative)}
                  style={{ background: colour.value }}
                >
                  <span className={styles.swatchLabelPlate}>
                    {colour.name}
                    <br />
                    {colour.value} · imagery only
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="type">
            <h2 id="type" className={styles.sectionTitle}>
              Type
            </h2>
            <dl className={styles.fontList}>
              <div>
                <dt>Display</dt>
                <dd>{direction.fonts.display}</dd>
              </div>
              <div>
                <dt>Text</dt>
                <dd>{direction.fonts.text}</dd>
              </div>
              <div>
                <dt>Devanagari</dt>
                <dd>{direction.fonts.devanagari}</dd>
              </div>
            </dl>
            <p className={styles.note}>{direction.fonts.note}</p>

            <ol className={styles.scale}>
              {TYPE_SCALE.map((step) => (
                <li key={step.name} className={styles.scaleStep}>
                  <span className={styles.scaleName}>{step.name}</span>
                  <span
                    className={
                      step.name === 'Body' || step.name === 'Lead'
                        ? styles.scaleText
                        : styles.scaleDisplay
                    }
                    style={{ fontSize: step.size }}
                  >
                    <span lang="sa-Latn">Vikṣepa</span>, the nine obstacles
                  </span>
                </li>
              ))}
            </ol>

            <div className={styles.specimens}>
              <p className={styles.specimen}>
                <span className={styles.specimenLabel}>IAST</span>
                <span lang="sa-Latn">
                  vikṣepa · Ṛta · kleśa · ātman · brahmavihāra · sthitaprajña · Ṣaḍdarśana
                </span>
              </p>
              <p className={styles.specimen}>
                <span className={styles.specimenLabel}>ISO 15919</span>
                <span lang="sa-Latn">r̥ṣi · kl̥pta · m̐</span>
              </p>
              <p className={styles.specimen}>
                <span className={styles.specimenLabel}>Devanagari</span>
                <span lang="sa-Deva" className={styles.specimenDeva}>
                  विक्षेप · क्लेश · स्थितप्रज्ञ · आकाङ्क्षा · उद्भव · श्रद्धा
                </span>
              </p>
              {intro?.kind === 'paragraph' ? <p className={styles.body}>{intro.text}</p> : null}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="card">
            <h2 id="card" className={styles.sectionTitle}>
              Concept card, and the click
            </h2>
            <p className={styles.note}>{direction.motion.click} Try it, then go back.</p>
            <CardDemo
              variant={direction.slug}
              concept={{
                slug: concept.slug,
                term: concept.term,
                gloss: concept.gloss,
                summary: concept.summary,
                firstLine: firstShloka?.devanagari[2] ?? '',
              }}
            />
          </section>

          <section className={styles.section} aria-labelledby="scroll">
            <h2 id="scroll" className={styles.sectionTitle}>
              Imagery, and the scroll
            </h2>
            <p className={styles.note}>
              {direction.imagery} {direction.motion.scroll}
            </p>
            {scrollDemo}
          </section>

          <section className={styles.section} aria-labelledby="mark">
            <h2 id="mark" className={styles.sectionTitle}>
              Wordmark
            </h2>
            <p className={styles.note}>{direction.wordmark}</p>
            <div className={styles.wordmarks}>{wordmark}</div>
          </section>

          <section className={styles.section} aria-labelledby="motion">
            <h2 id="motion" className={styles.sectionTitle}>
              Motion rules
            </h2>
            <ul className={styles.rules}>
              <li>
                <strong>Scroll.</strong> {direction.motion.scroll} Body text never animates in.
              </li>
              <li>
                <strong>Click.</strong> {direction.motion.click}
              </li>
              <li>
                <strong>Feedback.</strong> {direction.motion.feedback}
              </li>
              <li>
                <strong>Reduce motion.</strong> With the device’s “reduce motion” setting on, all of
                it stops: pages and cards swap without movement.
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
