import Link from 'next/link'
import { type CSSProperties, ViewTransition } from 'react'

import { turnForward } from '@/components/page-turn'
import { hrefFor } from '@/content'
import { toDevanagariDigits } from '@/lib/text'

import styles from './ConceptMap.module.css'
import { KIND_WORDS, KINDS } from './kinds'
import { litRules, type MapLayout, type MapPoint, RADIUS, SIZE } from './layout'
import { LineSwatch } from './LineSwatch'
import { MapFilters } from './MapFilters'

function ConceptLink({ point }: { point: MapPoint | undefined }) {
  if (!point) return null
  return (
    // The plate's points prefetch these pages already: the list's 148 links needn't watch too.
    <Link
      href={hrefFor({ kind: 'concept', id: point.slug })}
      transitionTypes={turnForward}
      prefetch={false}
    >
      <span {...(point.lang ? { lang: point.lang } : {})}>{point.name}</span>
    </Link>
  )
}

/**
 * The Concept map (Proposal, D20): a printed plate and, beside it, the same connections in words.
 * Everything is laid out while the site builds. The plate is three layers of hairline curves (SVG,
 * hidden from assistive technology), one per kind of connection, under the Concepts themselves:
 * ordinary links, in the topics' order. Pointing at or focusing a Concept lights its neighbours
 * through `:has()` rules made here; the filters are the page's one client island. Below about
 * 600 px the list leads and the plate waits one tap away, at #plate.
 */
export function ConceptMap({ layout }: { layout: MapLayout }) {
  const { top, height } = layout.view
  const view = `0 ${top} ${SIZE} ${height}`
  const place = new Map(layout.points.map((point) => [point.slug, point]))
  const id = new Map(layout.connections.map((connection, index) => [connection, `c${index}`]))
  const ofKind = (kind: (typeof KINDS)[number]) =>
    layout.connections.filter((connection) => connection.kind === kind)
  const attributes = (connection: MapLayout['connections'][number]) => ({
    'data-c': id.get(connection),
    'data-kind': connection.kind,
    'data-ends': `${connection.source} ${connection.target}`,
    'data-topics': connection.topics.join(' '),
  })

  return (
    <div className={styles.map} data-map>
      <style>{litRules(layout)}</style>
      <div className={styles.spread}>
        <MapFilters
          topics={layout.sectors.map(({ topic, name }) => ({ slug: topic, name }))}
          total={layout.connections.length}
        />
        <p className={styles.toPlate}>
          The same connections, drawn as a plate: <a href="#plate">See the map</a>
        </p>
        <figure id="plate" className={styles.figure} aria-labelledby="plate-caption">
          <p className={styles.toList}>
            <a href="#connections">Back to the list</a>
          </p>
          <div className={styles.plate} style={{ aspectRatio: `${SIZE} / ${height}` }}>
            <svg viewBox={view} aria-hidden="true" focusable="false">
              <circle className={styles.ring} cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} />
              {layout.sectors.map((sector) => (
                <g key={sector.topic} data-topic={sector.topic}>
                  {sector.arcs.map((arc) => (
                    <path key={arc} className={styles.arc} d={arc} pathLength={1} />
                  ))}
                  <text
                    className={styles.numeral}
                    x={sector.numeral.x}
                    y={sector.numeral.y}
                    lang="sa-Deva"
                  >
                    {toDevanagariDigits(String(sector.order))}
                  </text>
                </g>
              ))}
            </svg>
            {/* The weakest kind lowest, so the strongest lie on top. */}
            {KINDS.toReversed().map((kind) => (
              <svg
                key={kind}
                className={styles.lines}
                data-layer={kind}
                viewBox={view}
                aria-hidden="true"
                focusable="false"
              >
                {ofKind(kind).map((connection) => (
                  <path
                    key={connection.id}
                    className={styles.line}
                    d={connection.path}
                    {...attributes(connection)}
                  />
                ))}
              </svg>
            ))}
            <div className={styles.points}>
              {layout.sectors.map((sector) => (
                <ul key={sector.topic} className={styles.sector} aria-label={sector.name}>
                  {layout.points
                    .filter((point) => point.topic === sector.topic)
                    .map((point) => (
                      <li key={point.slug}>
                        <Link
                          href={hrefFor({ kind: 'concept', id: point.slug })}
                          transitionTypes={turnForward}
                          className={styles.point}
                          data-p={point.slug}
                          data-near={point.near.join(' ')}
                          data-topics={point.topics.join(' ')}
                          data-topic={point.topic}
                          data-side={point.side}
                          data-ink
                          style={
                            {
                              '--x': `${Math.round(point.x * 10) / 100}%`,
                              '--y': `${Math.round(((point.y - top) / height) * 10000) / 100}%`,
                              '--room': point.room,
                              '--i': layout.points.indexOf(point),
                            } as CSSProperties
                          }
                        >
                          <span className={styles.mark} aria-hidden />
                          <ViewTransition
                            name={`concept-title-${point.slug}`}
                            share="morph"
                            default="none"
                          >
                            <span
                              className={styles.label}
                              {...(point.lang ? { lang: point.lang } : {})}
                            >
                              {point.name}
                            </span>
                          </ViewTransition>
                        </Link>
                      </li>
                    ))}
                </ul>
              ))}
            </div>
          </div>
          <div className={styles.legend}>
            <div className={styles.legendGroup}>
              <p className={styles.legendTitle}>Lines</p>
              <ul className={styles.legendList}>
                {KINDS.map((kind) => (
                  <li key={kind}>
                    <LineSwatch kind={kind} />
                    <span>{KIND_WORDS[kind].legend}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.legendGroup}>
              <p className={styles.legendTitle}>Topics</p>
              <ul className={styles.legendList}>
                {layout.sectors.map((sector) => (
                  <li key={sector.topic} data-topic={sector.topic}>
                    <span className={styles.topicKey} lang="sa-Deva" aria-hidden>
                      {toDevanagariDigits(String(sector.order))}
                    </span>
                    <span>{sector.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <figcaption id="plate-caption" className={styles.caption}>
            The Concepts round a circle, one arc for each topic. Point at a Concept, or move to it
            with Tab, to light what it is joined to.
          </figcaption>
        </figure>

        <section
          id="connections"
          className={styles.connections}
          aria-labelledby="connections-title"
        >
          <h2 id="connections-title" className={styles.listTitle}>
            Connections
          </h2>
          <p className={styles.listNote}>
            Every line on the plate, in words: the two Concepts it joins and what they share.
          </p>
          {KINDS.map((kind) => (
            <section
              key={kind}
              className={styles.kind}
              data-kind-section={kind}
              aria-labelledby={`kind-${kind}`}
            >
              <h3 id={`kind-${kind}`} className={styles.kindTitle}>
                <LineSwatch kind={kind} />
                {KIND_WORDS[kind].heading}
              </h3>
              <ul className={styles.rows}>
                {ofKind(kind).map((connection) => (
                  <li key={connection.id} className={styles.row} {...attributes(connection)}>
                    <p className={styles.pair}>
                      <ConceptLink point={place.get(connection.source)} /> and{' '}
                      <ConceptLink point={place.get(connection.target)} />
                    </p>
                    <p className={styles.reasons}>
                      {connection.reasons.map((reason) => (
                        <span key={reason}>{reason}</span>
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </section>
      </div>
    </div>
  )
}
