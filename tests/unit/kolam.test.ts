import { describe, expect, it } from 'vitest'

import { kolam } from '@/lib/kolam'

type Point = readonly [number, number]

interface Curve {
  from: Point
  control: Point
  to: Point
}

/** Reads a kolam's path: one move, then quadratic curves. Any other command fails the test. */
function read(d: string) {
  const curves: Curve[] = []
  let start: Point | undefined
  let at: Point | undefined
  let moves = 0
  for (const [command, letter, args = ''] of d.matchAll(/([A-Za-z])([^A-Za-z]*)/g)) {
    const values = (args.match(/-?[\d.]+/g) ?? []).map(Number)
    if (letter === 'M' && values.length === 2) {
      const [x = NaN, y = NaN] = values
      moves += 1
      at = [x, y]
      start = at
    } else if (letter === 'Q' && values.length === 4 && at) {
      const [cx = NaN, cy = NaN, x = NaN, y = NaN] = values
      curves.push({ from: at, control: [cx, cy], to: [x, y] })
      at = [x, y]
    } else {
      throw new Error(`unexpected path command: ${command}`)
    }
  }
  if (!start || !at) throw new Error('the path is empty')
  return { moves, start, end: at, curves }
}

const onOneLine = (a: Point, b: Point, c: Point) =>
  Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) < 1e-9

/** A curve that really bends: its control point is off the straight line between its ends. */
const bends = (curve: Curve) => !onOneLine(curve.from, curve.control, curve.to)

/** Which diagonal a straight run lies on: 1 going down to the right, -1 going up to the right. */
const diagonal = ({ from, to }: Curve) => Math.sign((to[0] - from[0]) * (to[1] - from[1]))

const within = (a: number, b: number, value: number) =>
  Math.min(a, b) <= value && value <= Math.max(a, b)

/** The straight runs of the line that pass through a point. */
function runsThrough(curves: readonly Curve[], [x, y]: Point) {
  return curves.filter(
    (curve) =>
      !bends(curve) &&
      onOneLine(curve.from, curve.to, [x, y]) &&
      within(curve.from[0], curve.to[0], x) &&
      within(curve.from[1], curve.to[1], y),
  )
}

/** The gap between each pair of neighbouring dots, across or down. */
function gaps(dots: readonly Point[], spacing: number): Point[] {
  return dots.flatMap(([x, y]) =>
    dots
      .filter(([u, v]) => (u === x + spacing && v === y) || (u === x && v === y + spacing))
      .map(([u, v]): Point => [(x + u) / 2, (y + v) / 2]),
  )
}

// Worked by hand. An m × n kolam bounces off the edge of its box 2(m + n) times, rounding the
// outside of each outer dot, and crosses itself once in each of the 2mn − m − n gaps between dots.
const SIZES = [
  { columns: 1, rows: 1, dots: 1, width: 48, height: 48, bends: 4, crossings: 0 },
  { columns: 2, rows: 1, dots: 2, width: 96, height: 48, bends: 6, crossings: 1 },
  { columns: 3, rows: 2, dots: 6, width: 144, height: 96, bends: 10, crossings: 7 },
  { columns: 5, rows: 3, dots: 15, width: 240, height: 144, bends: 16, crossings: 22 },
]

describe('kolam', () => {
  it('draws one closed line round a single dot', () => {
    const { d, dots, width, height } = kolam(1, 1)
    const path = read(d)
    expect(path.moves).toBe(1)
    expect(path.end).toEqual(path.start)
    expect(dots).toEqual([[24, 24]])
    expect({ width, height }).toEqual({ width: 48, height: 48 })
  })

  for (const size of SIZES) {
    describe(`${size.columns}×${size.rows}`, () => {
      const { d, dots, width, height } = kolam(size.columns, size.rows)
      const path = read(d)

      it('is one unbroken line that closes on itself', () => {
        expect(path.moves).toBe(1)
        expect(path.end).toEqual(path.start)
      })

      it(`fits its ${size.dots}-dot grid in a box ${size.width} wide and ${size.height} high`, () => {
        expect(dots).toHaveLength(size.dots)
        expect({ width, height }).toEqual({ width: size.width, height: size.height })
      })

      it(`rounds ${size.bends} bends, each against the edge of the box`, () => {
        const turns = path.curves.filter(bends)
        expect(turns).toHaveLength(size.bends)
        for (const { control } of turns) {
          const [x, y] = control
          expect(x === 0 || x === width || y === 0 || y === height).toBe(true)
        }
      })

      it('crosses itself once in each gap between neighbouring dots', () => {
        const between = gaps(dots, width / size.columns)
        expect(between).toHaveLength(size.crossings)
        for (const gap of between) {
          expect(runsThrough(path.curves, gap).map(diagonal).sort()).toEqual([-1, 1])
        }
      })
    })
  }

  it('spaces the dots two units apart, one unit in from the edge', () => {
    const { dots, width, height } = kolam(2, 1, 10)
    expect(dots).toEqual([
      [10, 10],
      [30, 10],
    ])
    expect({ width, height }).toEqual({ width: 40, height: 20 })
  })

  describe('refuses sizes that would not make one whole kolam', () => {
    for (const [columns, rows] of [
      [2, 2],
      [4, 6],
      [9, 3],
    ] as const) {
      it(`throws for ${columns}×${rows}, which share a factor`, () => {
        expect(() => kolam(columns, rows)).toThrow(RangeError)
        expect(() => kolam(columns, rows)).toThrow('share a factor')
      })
    }

    for (const [columns, rows] of [
      [0, 1],
      [1, 0],
      [-1, 2],
      [1.5, 1],
      [2, 0.5],
      [NaN, 1],
      [1, Infinity],
    ] as const) {
      it(`throws for ${columns}×${rows}, which is not a positive whole number of dots`, () => {
        expect(() => kolam(columns, rows)).toThrow(RangeError)
        expect(() => kolam(columns, rows)).toThrow('positive whole number')
      })
    }

    for (const unit of [0, -24, NaN, Infinity]) {
      it(`throws for a unit of ${unit}`, () => {
        expect(() => kolam(2, 1, unit)).toThrow(RangeError)
        expect(() => kolam(2, 1, unit)).toThrow('positive length')
      })
    }
  })
})
