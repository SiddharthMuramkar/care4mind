import { describe, expect, it } from 'vitest'

import {
  countText,
  NOTHING,
  readSelection,
  shows,
  stands,
  writeSelection,
} from '@/components/map/filter'
import { layoutMap, type MapLayout } from '@/components/map/layout'
import type { ConceptGraph, ConceptGraphEdge } from '@/content'

// Front-end-site ticket 12: the Concept map's layout, worked out while the site builds (the
// browser runs none). The seam is the pure layout module: a graph and its topics in, the plate's
// points, sectors and curves out. A small graph made here keeps the expected values independent.

const TOPICS = [
  { slug: 'self', name: 'Self', order: 1 },
  { slug: 'mind', name: 'Mind', order: 2 },
  { slug: 'values', name: 'Values', order: 3 },
]

const node = (slug: string, topic: string, also: string[] = []) => ({
  slug,
  name: slug[0]!.toUpperCase() + slug.slice(1),
  href: `/concepts/${slug}/`,
  topic,
  topics: [topic, ...also],
})

const edge = (
  source: string,
  target: string,
  kind: ConceptGraphEdge['kind'],
  via: string,
  reason: string,
): ConceptGraphEdge => ({ source, target, kind, via, reason })

const GRAPH: ConceptGraph = {
  nodes: [
    node('atman', 'self'),
    node('jiva', 'self'),
    node('citta', 'mind', ['self']),
    node('klesha', 'mind'),
    node('vikshepa', 'mind'),
    node('ahimsa', 'values'),
    node('satya', 'values'),
  ],
  edges: [
    edge('atman', 'jiva', 'work', 'gita', 'Both quote the Gītā'),
    edge('citta', 'vikshepa', 'passage', 'ys/1.30', 'Both quote Yoga Sūtra 1.30'),
    edge('citta', 'vikshepa', 'reference', 'smith-2018', 'Both cite Smith (2018)'),
    edge('ahimsa', 'satya', 'passage', 'ys/2.30', 'Both quote Yoga Sūtra 2.30'),
    edge('ahimsa', 'satya', 'passage', 'ys/2.32', 'Both quote Yoga Sūtra 2.32'),
    edge('jiva', 'satya', 'work', 'gita', 'Both quote the Gītā'),
  ],
}

const CENTRE = 500
const radius = ({ x, y }: { x: number; y: number }) => Math.hypot(x - CENTRE, y - CENTRE)
/** Clockwise from the top, in degrees from 0 to 360, as the screen draws it (y grows down). */
const bearing = ({ x, y }: { x: number; y: number }) =>
  ((Math.atan2(x - CENTRE, CENTRE - y) * 180) / Math.PI + 360) % 360

describe('layoutMap', () => {
  const map: MapLayout = layoutMap(GRAPH, TOPICS)

  it('sets every Concept on one circle, in the graph’s order, so the tab order follows the topics', () => {
    expect(map.size).toBe(1000)
    expect(map.points.map(({ slug }) => slug)).toEqual(GRAPH.nodes.map(({ slug }) => slug))
    const radii = map.points.map(radius)
    for (const r of radii) expect(r).toBeCloseTo(radii[0]!, 0)
    expect(radii[0]).toBeGreaterThan(200)
    expect(radii[0]).toBeLessThan(400)
  })

  it('goes round the circle clockwise, one sector per topic, each holding only its own Concepts', () => {
    const bearings = map.points.map(bearing)
    expect(bearings).toEqual([...bearings].sort((a, b) => a - b))
    expect(map.sectors.map(({ topic }) => topic)).toEqual(['self', 'mind', 'values'])
    for (const sector of map.sectors) {
      const inside = map.points.filter((point) => {
        const at = bearing(point)
        return at >= sector.from && at <= sector.to
      })
      expect(inside.map(({ topic }) => topic)).toEqual(inside.map(() => sector.topic))
      expect(inside.length).toBe(GRAPH.nodes.filter(({ topic }) => topic === sector.topic).length)
    }
    for (const [before, after] of map.sectors.slice(1).map((s, i) => [map.sectors[i]!, s]))
      expect(after!.from).toBeGreaterThan(before!.to)
  })

  it('draws one curve for each pair of Concepts and kind of connection, strongest kind first, keeping every reason', () => {
    expect(
      map.connections.map(({ source, target, kind, reasons }) => ({
        source,
        target,
        kind,
        reasons,
      })),
    ).toEqual([
      {
        source: 'citta',
        target: 'vikshepa',
        kind: 'passage',
        reasons: ['Both quote Yoga Sūtra 1.30'],
      },
      {
        source: 'ahimsa',
        target: 'satya',
        kind: 'passage',
        reasons: ['Both quote Yoga Sūtra 2.30', 'Both quote Yoga Sūtra 2.32'],
      },
      {
        source: 'citta',
        target: 'vikshepa',
        kind: 'reference',
        reasons: ['Both cite Smith (2018)'],
      },
      { source: 'atman', target: 'jiva', kind: 'work', reasons: ['Both quote the Gītā'] },
      { source: 'jiva', target: 'satya', kind: 'work', reasons: ['Both quote the Gītā'] },
    ])
    expect(new Set(map.connections.map(({ id }) => id)).size).toBe(5)
  })

  it('runs each curve from one of its Concepts to the other, bowed in towards the centre', () => {
    const place = new Map(map.points.map((point) => [point.slug, point]))
    for (const { source, target, path } of map.connections) {
      const numbers = path.match(/-?\d+(\.\d+)?/g)!.map(Number)
      expect(path).toMatch(/^M[\d. -]+Q[\d. -]+$/)
      const [x1, y1, cx, cy, x2, y2] = numbers as [number, number, number, number, number, number]
      expect({ x: x1, y: y1 }).toEqual({ x: place.get(source)!.x, y: place.get(source)!.y })
      expect({ x: x2, y: y2 }).toEqual({ x: place.get(target)!.x, y: place.get(target)!.y })
      const middle = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
      expect(radius({ x: cx, y: cy })).toBeLessThanOrEqual(radius(middle) + 0.1)
    }
    // Two kinds joining the same pair take different curves.
    const [passage, reference] = map.connections.filter(({ source }) => source === 'citta')
    expect(passage!.path).not.toBe(reference!.path)
  })

  it('names each Concept’s neighbours, whatever joins them', () => {
    const near = Object.fromEntries(map.points.map(({ slug, near }) => [slug, near]))
    expect(near).toEqual({
      atman: ['jiva'],
      jiva: ['atman', 'satya'],
      citta: ['vikshepa'],
      klesha: [],
      vikshepa: ['citta'],
      ahimsa: ['satya'],
      satya: ['jiva', 'ahimsa'],
    })
  })

  it('gives each connection the topics of both its Concepts, for the topic filter', () => {
    const topicsOf = (source: string, target: string) =>
      map.connections.find((c) => c.source === source && c.target === target)?.topics
    expect(topicsOf('jiva', 'satya')).toEqual(['self', 'values'])
    expect(topicsOf('citta', 'vikshepa')).toEqual(['mind', 'self'])
  })
})

// The filters' state lives in the address: one kind of connection at a time, and any topics.
describe('the map’s filters', () => {
  const known = new Set(['self', 'mind', 'values'])

  it('reads the kind and topics an address asks for, keeping only known values and one kind', () => {
    expect(readSelection('?kind=passage&topic=mind,self', known)).toEqual({
      kind: 'passage',
      topic: ['mind', 'self'],
    })
    expect(readSelection('?kind=lines,work,passage&topic=mind,,elsewhere,mind', known)).toEqual({
      kind: 'work',
      topic: ['mind'],
    })
    expect(readSelection('', known)).toEqual(NOTHING)
    expect(readSelection('?q=atman', known)).toEqual(NOTHING)
  })

  it('writes a selection back as a query string, or none for everything', () => {
    expect(writeSelection({ kind: 'reference', topic: ['values', 'self'] })).toBe(
      '?kind=reference&topic=values,self',
    )
    expect(writeSelection({ kind: null, topic: ['mind'] })).toBe('?topic=mind')
    expect(writeSelection(NOTHING)).toBe('')
  })

  it('shows a connection of the chosen kind that touches a chosen topic', () => {
    const connection = { kind: 'passage' as const, topics: ['mind', 'self'] }
    expect(shows(connection, NOTHING)).toBe(true)
    expect(shows(connection, { kind: 'passage', topic: [] })).toBe(true)
    expect(shows(connection, { kind: 'work', topic: [] })).toBe(false)
    expect(shows(connection, { kind: null, topic: ['values', 'self'] })).toBe(true)
    expect(shows(connection, { kind: 'passage', topic: ['values'] })).toBe(false)
  })

  it('keeps a Concept in full while no topic is chosen, or it is in one of them', () => {
    expect(stands(['mind', 'self'], NOTHING)).toBe(true)
    expect(stands(['mind', 'self'], { kind: 'work', topic: ['self'] })).toBe(true)
    expect(stands(['mind'], { kind: null, topic: ['values'] })).toBe(false)
  })

  it('says how many connections show, for the polite announcement', () => {
    expect(countText(74, 74)).toBe('Showing all 74 connections')
    expect(countText(8, 74)).toBe('Showing 8 of 74 connections')
    expect(countText(1, 74)).toBe('Showing 1 of 74 connections')
    expect(countText(0, 74)).toBe('No connection matches these filters')
  })
})
