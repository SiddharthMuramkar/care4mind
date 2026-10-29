import { cx } from '@/lib/cx'

import styles from './ConceptMap.module.css'
import { KINDS } from './kinds'
import { type MapLayout, RADIUS, SIZE } from './layout'

/**
 * The Concept map's plate as a still picture: the circle, the topics' arcs, every curve and a
 * mark for each Concept, with no names and nothing to press. Decoration beside a link to the map
 * (the proposals page; the homepage's teaser may use it too), so it is hidden from assistive
 * technology and never moves.
 */
export function PlatePicture({ layout, className }: { layout: MapLayout; className?: string }) {
  const { top, height } = layout.view
  return (
    <svg
      className={cx(styles.picture, className)}
      viewBox={`0 ${top} ${SIZE} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle className={styles.ring} cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} />
      {layout.sectors.map((sector) => (
        <g key={sector.topic} data-topic={sector.topic}>
          {sector.arcs.map((arc) => (
            <path key={arc} className={styles.stillArc} d={arc} />
          ))}
        </g>
      ))}
      {KINDS.toReversed().map((kind) =>
        layout.connections
          .filter((connection) => connection.kind === kind)
          .map((connection) => (
            <path
              key={connection.id}
              className={styles.line}
              data-kind={kind}
              d={connection.path}
            />
          )),
      )}
      {layout.points.map((point) => (
        <rect
          key={point.slug}
          className={styles.stillMark}
          data-topic={point.topic}
          x={point.x - 9}
          y={point.y - 9}
          width={18}
          height={18}
          transform={`rotate(45 ${point.x} ${point.y})`}
        />
      ))}
    </svg>
  )
}
