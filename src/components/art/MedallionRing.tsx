import { cx } from '@/lib/cx'

import styles from './MedallionRing.module.css'

/** The frame's own coordinates: a 240 box, centred on 120 120. */
const VIEW = 240
const DOT_RADIUS = 116.5

/** Below this the flower and the laurels would be a smudge, so only the two rings are drawn. */
const FULL_FRAME_FROM = 96

/** Keeps the lines from going faint at small sizes: the frame is drawn for 144 px and up. */
const weight = (size: number) => Math.max(1, 144 / size)

/**
 * A ring of dots as one path of zero-length strokes, which round caps draw as dots. `gaps` lists
 * the arcs left clear for the flower and the laurels, as half-widths in degrees either side of
 * the top and the bottom.
 */
function dotRing(count: number, gaps = { top: -1, bottom: -1 }) {
  let path = ''
  for (let step = 0; step < count; step++) {
    const degrees = (step / count) * 360
    if (Math.min(degrees, 360 - degrees) < gaps.top) continue
    if (Math.abs(degrees - 180) < gaps.bottom) continue
    const radians = (degrees * Math.PI) / 180
    const x = 120 + DOT_RADIUS * Math.sin(radians)
    const y = 120 - DOT_RADIUS * Math.cos(radians)
    path += `M${x.toFixed(2)} ${y.toFixed(2)}h0`
  }
  return path
}

const PLAIN_DOTS = dotRing(36)
const FULL_DOTS = dotRing(72, { top: 18, bottom: 46 })
const PLAIN_HAIRLINE = 'M9 120a111 111 0 1 0 222 0a111 111 0 1 0-222 0'

// The Emblem's frame: the hairline stops either side of the flower, and two laurel sprigs grow up
// from the bottom. Left-hand parts are the right-hand ones mirrored.
const FRAME = {
  hairline: 'M139.27 10.69A111 111 0 1 1 100.73 10.69',
  petals:
    'M120 5.3Q121.35 3.4 120 1.5Q118.65 3.4 120 5.3ZM121.56 5.94Q123.85 5.56 124.24 3.26Q121.94 3.65 121.56 5.94ZM122.2 7.5Q124.1 8.85 126 7.5Q124.1 6.15 122.2 7.5ZM121.56 9.06Q121.94 11.35 124.24 11.74Q123.85 9.44 121.56 9.06ZM120 9.7Q118.65 11.6 120 13.5Q121.35 11.6 120 9.7ZM118.44 9.06Q116.15 9.44 115.76 11.74Q118.06 11.35 118.44 9.06ZM117.8 7.5Q115.9 6.15 114 7.5Q115.9 8.85 117.8 7.5ZM118.44 5.94Q118.06 3.65 115.76 3.26Q116.15 5.56 118.44 5.94Z',
  heart: 'M118.6 7.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0-2.8 0',
  leaf: 'M128 8.2Q132.99 12.37 139.27 10.69Q134.28 6.51 128 8.2Z',
  leafRib: 'M128 8.2L139.27 10.69',
  laurel:
    'M133.53 230.17Q138.81 235.1 145.86 236.67Q140.58 231.74 133.53 230.17ZM148.73 227.22Q154.65 231.36 161.85 231.93Q155.93 227.79 148.73 227.22ZM163.37 222.18Q169.81 225.46 177.02 225.02Q170.58 221.74 163.37 222.18ZM177.17 215.15Q184 217.5 191.08 216.06Q184.25 213.71 177.17 215.15ZM189.85 206.26Q196.95 207.64 203.76 205.23Q196.67 203.85 189.85 206.26Z',
  laurelRibs:
    'M133.53 230.17L145.86 236.67M148.73 227.22L161.85 231.93M163.37 222.18L177.02 225.02M177.17 215.15L191.08 216.06M189.85 206.26L203.76 205.23',
  bud: 'M120 236.5Q122.6 232.75 120 229Q117.4 232.75 120 236.5Z',
  budStem: 'M120 231V236.5',
} as const

/** Flip the right-hand parts across the frame's upright centre line. */
const MIRROR = `matrix(-1 0 0 1 ${VIEW} 0)`

/** A line of the frame that inks in with the scroll: one dash as long as itself. */
function Stroke({ d, width }: { d: string; width?: number }) {
  return <path className={styles.stroke} pathLength={1} d={d} strokeWidth={width} />
}

/** The parts drawn on each side of the upright centre line. */
function Side({ ribWidth }: { ribWidth: number }) {
  return (
    <>
      <Stroke d={FRAME.leaf} />
      <Stroke d={FRAME.leafRib} width={ribWidth} />
      <Stroke d={FRAME.laurel} />
      <Stroke d={FRAME.laurelRibs} width={ribWidth} />
    </>
  )
}

/**
 * The ring around a Medallion, the Emblem's frame redrawn as an Ornament: a ring of dots outside a
 * hairline, a small flower at the top between two leaves, and two laurel sprigs meeting at the
 * bottom. Below 96 px only the two rings. Decorative, in the current colour, with no ids. Fully
 * drawn by default; it inks in with the scroll unless `still`.
 */
export function MedallionRing({
  size,
  still = false,
  className,
}: {
  size: number
  still?: boolean
  className?: string
}) {
  const full = size >= FULL_FRAME_FROM
  const ribWidth = 0.66 * weight(size)
  return (
    <svg
      className={cx(styles.ring, !still && styles.inks, className)}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.1 * (full ? weight(size) : VIEW / size)}
      >
        <path
          className={styles.dots}
          strokeWidth={full ? 2.8 * weight(size) : (1.9 * VIEW) / size}
          d={full ? FULL_DOTS : PLAIN_DOTS}
        />
        {full ? (
          <>
            <Stroke d={FRAME.hairline} />
            <Stroke d={FRAME.petals} />
            <Stroke d={FRAME.heart} />
            <Side ribWidth={ribWidth} />
            <g transform={MIRROR}>
              <Side ribWidth={ribWidth} />
            </g>
            <Stroke d={FRAME.bud} />
            <Stroke d={FRAME.budStem} width={ribWidth} />
          </>
        ) : (
          <Stroke d={PLAIN_HAIRLINE} />
        )}
      </g>
    </svg>
  )
}
