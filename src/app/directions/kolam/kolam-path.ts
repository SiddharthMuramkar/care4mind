/**
 * A kolam as a billiard path: a line bouncing at 45° inside a box of m × n
 * dots, passing between every pair of neighbours and turning round the
 * outer dots. When m and n share no factor it is one unbroken loop, as a
 * kolam should be.
 */
export function kolam(m: number, n: number, unit = 24) {
  const width = 2 * m
  const height = 2 * n
  const points: [number, number][] = []
  let [x, y, dx, dy] = [1, 0, 1, 1]
  do {
    points.push([x, y])
    x += dx
    y += dy
    if (x === 0 || x === width) dx = -dx
    if (y === 0 || y === height) dy = -dy
  } while (!(x === 1 && y === 0 && dx === 1 && dy === 1))

  // Round every bounce: each wall point becomes the control point of a curve.
  const scale = (value: number) => +(value * unit).toFixed(2)
  const mid = (a: [number, number], b: [number, number]): [number, number] => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ]
  const segments: string[] = []
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length] ?? point
    const previous = points.at(index - 1) ?? point
    if (index === 0) {
      const start = mid(previous, point)
      segments.push(`M${scale(start[0])} ${scale(start[1])}`)
    }
    const end = mid(point, next)
    segments.push(`Q${scale(point[0])} ${scale(point[1])} ${scale(end[0])} ${scale(end[1])}`)
  })

  const dots: [number, number][] = []
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++) dots.push([scale(2 * i + 1), scale(2 * j + 1)])

  return { d: segments.join(''), dots, width: scale(width), height: scale(height) }
}
