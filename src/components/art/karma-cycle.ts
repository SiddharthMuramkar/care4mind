/*
 * The Karma Yoga cycle, once: the words of the old site's picture, spelled as it spelled them,
 * and where each sits on the drawing. The drawing and its list are both built from this.
 */

/** A stretch of one line. Romanised Sanskrit is marked, so the page can say which language it is in. */
export interface Run {
  text: string
  sanskrit?: true
}

const sa = (text: string): Run => ({ text, sanskrit: true })
const en = (text: string): Run => ({ text })

export interface Line {
  runs: readonly Run[]
  /** Half the width to strike through, from the word's centre, in em. A word not struck has none. */
  strike?: number
}

export type Point = readonly [x: number, y: number]

export interface CycleNode {
  id: string
  lines: readonly Line[]
  at: Point
  /** How the list runs its lines together: the words of one name, a gloss, or a pair. */
  joined: 'name' | 'gloss' | 'pair'
}

const karmabija: CycleNode = {
  id: 'karmabija',
  lines: [{ runs: [sa('Karmabija')], strike: 2.31 }],
  at: [905, 172],
  joined: 'name',
}

const dharmabaddha: CycleNode = {
  id: 'dharmabaddha',
  lines: [{ runs: [sa('Dharmabaddha')] }, { runs: [sa('Kama'), en(' (Desire)')] }],
  at: [905, 404],
  joined: 'name',
}

const nischayam: CycleNode = {
  id: 'nischayam',
  lines: [{ runs: [sa('Nischayam')] }, { runs: [en('Resolve')] }],
  at: [540, 650],
  joined: 'gloss',
}

const karma: CycleNode = {
  id: 'karma',
  lines: [{ runs: [sa('Karma')] }, { runs: [en('Action')] }],
  at: [150, 438],
  joined: 'gloss',
}

const karmaphala: CycleNode = {
  id: 'karmaphala',
  lines: [
    { runs: [sa('Karmaphala')], strike: 2.71 },
    { runs: [sa('Punya'), en(' or '), sa('Papa')], strike: 3.1 },
  ],
  at: [165, 168],
  joined: 'pair',
}

/** The five that stand on the circle, clockwise from the top right. */
export const CYCLE_NODES = [karmabija, dharmabaddha, nischayam, karma, karmaphala] as const

/** The words at the centre of the circle. */
export const CYCLE_CENTRE: { lines: readonly Line[]; at: Point } = {
  lines: [{ runs: [sa('Karmabandha')] }, { runs: [sa('Mochana')] }],
  at: [540, 340],
}

export interface CycleArrow {
  id: string
  label: Run
  labelAt: Point
  /** A cubic Bézier: where it starts, its two controls, and the point it ends on. */
  curve: readonly [Point, Point, Point, Point]
  /** Which of the cycle's arrow colours it takes. */
  tone: 1 | 2 | 3 | 4 | 5
  to: CycleNode
}

export interface CycleStep extends CycleArrow {
  from: CycleNode
}

/** The arrows around the circle, in the order the cycle is read. */
export const CYCLE_STEPS: readonly CycleStep[] = [
  {
    id: 'manonigraha',
    label: sa('Manonigraha'),
    labelAt: [840, 305],
    curve: [
      [1016, 192],
      [1072, 255],
      [1072, 310],
      [1016, 362],
    ],
    tone: 2,
    from: karmabija,
    to: dharmabaddha,
  },
  {
    id: 'buddhi',
    label: sa('Buddhi'),
    labelAt: [918, 622],
    curve: [
      [900, 490],
      [895, 590],
      [800, 652],
      [668, 670],
    ],
    tone: 3,
    from: dharmabaddha,
    to: nischayam,
  },
  {
    id: 'svadharma',
    label: sa('Svadharma'),
    labelAt: [135, 626],
    curve: [
      [412, 670],
      [290, 652],
      [185, 592],
      [165, 512],
    ],
    tone: 4,
    from: nischayam,
    to: karma,
  },
  {
    id: 'phala-tyaga',
    label: sa('Phala-Tyaga'),
    labelAt: [245, 318],
    curve: [
      [92, 392],
      [28, 340],
      [28, 292],
      [72, 246],
    ],
    tone: 5,
    from: karma,
    to: karmaphala,
  },
  {
    id: 'citta-shuddhi',
    label: sa('Citta-shuddhi'),
    labelAt: [540, 134],
    curve: [
      [322, 124],
      [432, 36],
      [678, 36],
      [788, 124],
    ],
    tone: 1,
    from: karmaphala,
    to: karmabija,
  },
]

/** The small arrow that comes into the circle from outside it. */
export const CYCLE_LOKASAMGRAHA: CycleArrow = {
  id: 'lokasamgraha',
  label: sa('Lokasamgraha'),
  labelAt: [200, 50],
  curve: [
    [108, 64],
    [100, 84],
    [106, 106],
    [128, 124],
  ],
  tone: 5,
  to: karmaphala,
}

export const CYCLE_TITLE = 'The Karma Yoga cycle'

export const CYCLE_DESCRIPTION =
  'A cycle of action. Karmabija leads, through Manonigraha, to Dharmabaddha Kama (desire); through Buddhi to Nischayam (resolve); through Svadharma to Karma (action); and through Phala-Tyaga to Karmaphala, punya or papa. Lokasamgraha also leads into Karmaphala. Karmaphala and Karmabija are struck through, and Citta-shuddhi leads from Karmaphala back to Karmabija. At the centre: Karmabandha Mochana.'

/** The path of a cubic curve. */
export const pathOf = ([from, near, far, to]: CycleArrow['curve']) =>
  `M ${from[0]} ${from[1]} C ${near[0]} ${near[1]} ${far[0]} ${far[1]} ${to[0]} ${to[1]}`

/** The transform that lays an arrowhead on a curve's end, pointing the way the curve is going. */
export const headOf = ([, , far, to]: CycleArrow['curve']) => {
  const degrees = (Math.atan2(to[1] - far[1], to[0] - far[0]) * 180) / Math.PI
  return `translate(${to[0]} ${to[1]}) rotate(${degrees.toFixed(1)})`
}
