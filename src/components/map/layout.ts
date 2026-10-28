/**
 * The Concept map's layout (D20, design C5), worked out while the site builds so the browser runs
 * no layout code. The Concepts sit on one circle, one sector per topic, clockwise from the top in
 * the graph's order (so the tab order follows the topics). The topics are split between the
 * circle's right and left halves, and each half spaces its Concepts evenly from top to bottom:
 * their names are set across, so even spacing down the page keeps neighbouring names apart.
 * Coordinates are in a square of SIZE units, its centre at the middle.
 */
import type { ConceptGraph, ConceptGraphEdge, ConceptGraphNode } from '@/content'

export const SIZE = 1000
const CENTRE = SIZE / 2
/** The circle the Concepts sit on. */
export const RADIUS = 300
/** How far up and down each half reaches, in degrees from the level: the poles stay clear. */
const REACH = 68
/** The extra space between two topics on the same half, in steps between Concepts. */
const TOPIC_GAP = 0.8
/** How far a sector's arc runs past its first and last Concept, in degrees. */
const SECTOR_PAD = 4

export type ConnectionKind = ConceptGraphEdge['kind']

/** The kinds of connection, strongest first (D06): the list's order, and the plate's top layer first. */
export const KINDS: readonly ConnectionKind[] = ['passage', 'reference', 'work']

/**
 * How far each kind's curve stays from the centre, as a share of the way from the centre to the
 * middle of the straight line between its Concepts: two kinds joining one pair take apart curves.
 */
const BOW: Readonly<Record<ConnectionKind, number>> = { passage: 0.22, reference: 0.46, work: 0.1 }

export interface MapTopic {
  slug: string
  name: string
  order: number
}

export interface MapPoint extends ConceptGraphNode {
  x: number
  y: number
  /** Clockwise from the top, in degrees. */
  bearing: number
  /** The half of the circle it sits on: its name is set outward from there. */
  side: 'right' | 'left'
  /** The Concepts it shares a connection with, of any kind, in the graph's order. */
  near: string[]
}

/** One curve on the plate: two Concepts joined by one kind of connection, with every fact behind it. */
export interface MapConnection {
  /** `passage:ahimsa:satya` */
  id: string
  source: string
  target: string
  kind: ConnectionKind
  /** Each fact, as the content gives it: "Both quote Yoga Sūtra 2.30". */
  reasons: string[]
  /** Every topic either Concept is in. */
  topics: string[]
  /** Its curve, as an SVG path from the source to the target. */
  path: string
}

export interface MapSector {
  topic: string
  name: string
  order: number
  /** Where its arc starts and ends, clockwise from the top, in degrees. */
  from: number
  to: number
  /** Its arc on the circle, as an SVG path. */
  arc: string
}

export interface MapLayout {
  size: number
  points: MapPoint[]
  sectors: MapSector[]
  connections: MapConnection[]
}

const round = (value: number) => Math.round(value * 10) / 10

/** The place on a circle at a bearing (degrees clockwise from the top). */
export function at(bearing: number, radius = RADIUS) {
  const angle = (bearing * Math.PI) / 180
  return {
    x: round(CENTRE + radius * Math.sin(angle)),
    y: round(CENTRE - radius * Math.cos(angle)),
  }
}

const bearingOf = (x: number, y: number) =>
  ((Math.atan2(x - CENTRE, CENTRE - y) * 180) / Math.PI + 360) % 360

/** The topics on the right half, the rest on the left: as near an even split as the topics allow. */
function split(groups: readonly ConceptGraphNode[][]) {
  const total = groups.reduce((sum, group) => sum + group.length, 0)
  let best = groups.length
  let gap = Infinity
  let before = 0
  for (let index = 0; index < groups.length; index++) {
    const off = Math.abs(total - 2 * before)
    if (index > 0 && off < gap) [best, gap] = [index, off]
    before += groups[index]!.length
  }
  if (groups.length === 1) best = 1
  return [groups.slice(0, best), groups.slice(best)] as const
}

/** One half's Concepts, spaced evenly down it (right) or up it (left). */
function placeHalf(groups: readonly ConceptGraphNode[][], side: 'right' | 'left'): MapPoint[] {
  const nodes = groups.flat()
  const steps = Math.max(nodes.length - 1 + (groups.length - 1) * TOPIC_GAP, 0)
  const span = 2 * RADIUS * Math.sin((REACH * Math.PI) / 180)
  const step = steps === 0 ? 0 : span / steps
  const points: MapPoint[] = []
  let offset = steps === 0 ? span / 2 : 0
  groups.forEach((group, index) => {
    if (index > 0) offset += step * TOPIC_GAP
    for (const node of group) {
      // Right: top to bottom. Left: bottom to top, so the whole goes round clockwise.
      const dy = side === 'right' ? offset - span / 2 : span / 2 - offset
      const dx = Math.sqrt(RADIUS * RADIUS - dy * dy) * (side === 'right' ? 1 : -1)
      const x = round(CENTRE + dx)
      const y = round(CENTRE + dy)
      points.push({ ...node, x, y, bearing: round(bearingOf(x, y)), side, near: [] })
      offset += step
    }
  })
  return points
}

/** An arc of the circle, clockwise from one bearing to another. */
function arcPath(from: number, to: number) {
  const start = at(from)
  const end = at(to)
  const large = to - from > 180 ? 1 : 0
  return `M${start.x} ${start.y}A${RADIUS} ${RADIUS} 0 ${large} 1 ${end.x} ${end.y}`
}

/** The plate: where each Concept sits and each topic's sector. */
export function layoutMap(graph: ConceptGraph, topics: readonly MapTopic[]): MapLayout {
  const used = topics.filter((topic) => graph.nodes.some((node) => node.topic === topic.slug))
  const groups = used.map((topic) => graph.nodes.filter((node) => node.topic === topic.slug))
  const [right, left] = split(groups)
  const points = [...placeHalf(right, 'right'), ...placeHalf(left, 'left')]

  const sectors = used.map((topic) => {
    const own = points.filter((point) => point.topic === topic.slug)
    const from = round(Math.min(...own.map(({ bearing }) => bearing)) - SECTOR_PAD)
    const to = round(Math.max(...own.map(({ bearing }) => bearing)) + SECTOR_PAD)
    return {
      topic: topic.slug,
      name: topic.name,
      order: topic.order,
      from,
      to,
      arc: arcPath(from, to),
    }
  })

  return { size: SIZE, points, sectors, connections: connect(graph, points) }
}

/** The graph's facts as curves: one for each pair and kind, strongest kind first, then in the graph's order. */
function connect(graph: ConceptGraph, points: MapPoint[]): MapConnection[] {
  const place = new Map(points.map((point) => [point.slug, point]))
  const byId = new Map<string, MapConnection>()
  for (const { source, target, kind, reason } of graph.edges) {
    const from = place.get(source)
    const to = place.get(target)
    if (!from || !to) continue
    const id = `${kind}:${source}:${target}`
    const known = byId.get(id)
    if (known) {
      if (!known.reasons.includes(reason)) known.reasons.push(reason)
      continue
    }
    const topics = [...new Set([...from.topics, ...to.topics])]
    byId.set(id, {
      id,
      source,
      target,
      kind,
      reasons: [reason],
      topics,
      path: curve(from, to, kind),
    })
    if (!from.near.includes(target)) from.near.push(target)
    if (!to.near.includes(source)) to.near.push(source)
  }
  const order = new Map(points.map(({ slug }, index) => [slug, index]))
  for (const point of points) point.near.sort((a, b) => order.get(a)! - order.get(b)!)
  const all = [...byId.values()]
  return KINDS.flatMap((kind) => all.filter((connection) => connection.kind === kind))
}

/** A curve between two places, bowed in towards the centre by its kind's share. */
function curve(from: MapPoint, to: MapPoint, kind: ConnectionKind) {
  const bow = BOW[kind]
  const cx = round(CENTRE + ((from.x + to.x) / 2 - CENTRE) * bow)
  const cy = round(CENTRE + ((from.y + to.y) / 2 - CENTRE) * bow)
  return `M${from.x} ${from.y}Q${cx} ${cy} ${to.x} ${to.y}`
}
