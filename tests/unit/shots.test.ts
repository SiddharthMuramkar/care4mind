import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { hrefFor, site, type RouteEntry } from '@/content'

// `pnpm shots`, the parts with no browser: what the command line asks
// for, which routes it picks from the registry and the file each shot lands in.

interface Options {
  full: boolean
  reduced: 'off' | 'on' | 'both'
  only: string[] | null
  widths: number[]
  states: string | null
}

interface Shot {
  path: string
  width: number
  height: number
  reducedMotion: boolean
  full: boolean
  file: string
  state?: 'hover' | 'focus-visible' | 'active'
  selector?: string
}

const shots = (await import(pathToFileURL(resolve('scripts/shots.mjs')).href)) as {
  parseArgs(argv: readonly string[]): Options
  planShots(options: Options, routes: readonly RouteEntry[]): Shot[]
  describeServer(port: number, buildId: string | null): Promise<string>
  loadRoutes(): Promise<readonly RouteEntry[]>
}

const route = (path: RouteEntry['path'], kind: RouteEntry['kind'], sample?: true): RouteEntry => ({
  path,
  kind,
  pattern: path,
  title: path,
  ...(sample ? { sample } : {}),
})

/** A registry in miniature: two kinds with a sample each, and pages that aren't samples. */
const REGISTRY: readonly RouteEntry[] = [
  route(hrefFor({ page: 'home' }), 'home', true),
  route(hrefFor({ page: 'concepts' }), 'concepts', true),
  route(hrefFor({ kind: 'concept', id: 'ahimsa' }), 'concept', true),
  route(hrefFor({ kind: 'concept', id: 'vikshepa' }), 'concept'),
  route(
    hrefFor({ kind: 'questionnaire', id: 'karmayoga-scale', status: 'preview', flow: true }),
    'questionnaire-flow',
    true,
  ),
]

const plan = (...argv: string[]) => shots.planShots(shots.parseArgs(argv), REGISTRY)
const files = (...argv: string[]) => plan(...argv).map((shot) => shot.file)
/** A state shot's file, whatever the hash: one test below pins how it is made. */
const hashed = (name: string): unknown =>
  expect.stringMatching(new RegExp(`^${name}-[0-9a-f]{6}\\.jpg$`))

describe('pnpm shots', () => {
  it('shoots each sample route at phone and desktop width, with motion, by default', () => {
    expect(plan()).toEqual([
      {
        path: '/',
        width: 360,
        height: 800,
        reducedMotion: false,
        full: false,
        file: 'home-360.jpg',
      },
      {
        path: '/',
        width: 1440,
        height: 900,
        reducedMotion: false,
        full: false,
        file: 'home-1440.jpg',
      },
      {
        path: '/concepts/',
        width: 360,
        height: 800,
        reducedMotion: false,
        full: false,
        file: 'concepts-360.jpg',
      },
      {
        path: '/concepts/',
        width: 1440,
        height: 900,
        reducedMotion: false,
        full: false,
        file: 'concepts-1440.jpg',
      },
      {
        path: '/concepts/ahimsa/',
        width: 360,
        height: 800,
        reducedMotion: false,
        full: false,
        file: 'concepts-ahimsa-360.jpg',
      },
      {
        path: '/concepts/ahimsa/',
        width: 1440,
        height: 900,
        reducedMotion: false,
        full: false,
        file: 'concepts-ahimsa-1440.jpg',
      },
      {
        path: '/questionnaires/karmayoga-scale/take/',
        width: 360,
        height: 800,
        reducedMotion: false,
        full: false,
        file: 'questionnaires-karmayoga-scale-take-360.jpg',
      },
      {
        path: '/questionnaires/karmayoga-scale/take/',
        width: 1440,
        height: 900,
        reducedMotion: false,
        full: false,
        file: 'questionnaires-karmayoga-scale-take-1440.jpg',
      },
    ])
  })

  it('takes --only route paths or kinds, comma-separated: a kind is its sample route', () => {
    expect(files('--only', '/,concept')).toEqual([
      'home-360.jpg',
      'home-1440.jpg',
      'concepts-ahimsa-360.jpg',
      'concepts-ahimsa-1440.jpg',
    ])
    expect(files('--only=/concepts/vikshepa/')).toEqual([
      'concepts-vikshepa-360.jpg',
      'concepts-vikshepa-1440.jpg',
    ])
  })

  it('shoots a route --only names twice once, in the registry’s order', () => {
    expect(files('--only', 'concept, home ,/,/concepts/ahimsa')).toEqual([
      'home-360.jpg',
      'home-1440.jpg',
      'concepts-ahimsa-360.jpg',
      'concepts-ahimsa-1440.jpg',
    ])
  })

  it('stops at a path or kind --only doesn’t know, naming what it takes', () => {
    expect(() => plan('--only', '/,/concepts/nowhere/')).toThrow(
      /“\/concepts\/nowhere\/”.*a page’s path in the route registry.*kinds: home, concepts, concept, questionnaire-flow/s,
    )
    expect(() => plan('--only', 'glossary')).toThrow(/“glossary”/)
    expect(() => plan('--only', '')).toThrow(/--only takes/)
  })

  it('takes other widths from --widths, each with a screen height to match', () => {
    expect(
      plan('--only', '/', '--widths', '320,768,1024').map(({ width, height }) => [width, height]),
    ).toEqual([
      [320, 800],
      [768, 1024],
      [1024, 900],
    ])
    expect(() => plan('--widths', '320,wide')).toThrow(/--widths takes .*“wide”/s)
    expect(() => plan('--widths', '0')).toThrow(/--widths takes/)
    expect(() => plan('--widths')).toThrow(/--widths takes/)
  })

  it('shoots with reduced motion under --reduced, and both ways under --both', () => {
    expect(files('--only', '/', '--reduced')).toEqual([
      'home-360-reduced.jpg',
      'home-1440-reduced.jpg',
    ])
    expect(plan('--only', '/', '--reduced').every((shot) => shot.reducedMotion)).toBe(true)
    expect(files('--only', '/concepts/vikshepa/', '--widths', '1440', '--both')).toEqual([
      'concepts-vikshepa-1440.jpg',
      'concepts-vikshepa-1440-reduced.jpg',
    ])
  })

  it('shoots the viewport, and whole pages under --full', () => {
    expect(shots.parseArgs([]).full).toBe(false)
    expect(shots.parseArgs(['--full']).full).toBe(true)
    expect(plan('--only', '/').every((shot) => !shot.full)).toBe(true)
    expect(plan('--only', '/', '--full').every((shot) => shot.full)).toBe(true)
  })

  it('shoots a state the screen’s worth, even under --full', () => {
    expect(plan('--only', '/', '--full', '--states', 'main a').some((shot) => shot.full)).toBe(
      false,
    )
  })

  it('shoots a selector in its hover, focus-visible and active states', () => {
    expect(plan('--only', '/', '--widths', '360', '--states', 'main article a')).toEqual([
      {
        path: '/',
        width: 360,
        height: 800,
        reducedMotion: false,
        full: false,
        file: 'home-360-hover-main-article-a-572cdb.jpg',
        state: 'hover',
        selector: 'main article a',
      },
      {
        path: '/',
        width: 360,
        height: 800,
        reducedMotion: false,
        full: false,
        file: 'home-360-focus-visible-main-article-a-572cdb.jpg',
        state: 'focus-visible',
        selector: 'main article a',
      },
      {
        path: '/',
        width: 360,
        height: 800,
        reducedMotion: false,
        full: false,
        file: 'home-360-active-main-article-a-572cdb.jpg',
        state: 'active',
        selector: 'main article a',
      },
    ])
  })

  it('shoots the states at each width', () => {
    expect(files('--only', '/', '--widths', '360,1440', '--states', 'main article a')).toEqual([
      hashed('home-360-hover-main-article-a'),
      hashed('home-360-focus-visible-main-article-a'),
      hashed('home-360-active-main-article-a'),
      hashed('home-1440-hover-main-article-a'),
      hashed('home-1440-focus-visible-main-article-a'),
      hashed('home-1440-active-main-article-a'),
    ])
  })

  it('gives different selectors different files, even when their letters match', () => {
    const fileOf = (selector: string) =>
      plan('--only', '/', '--widths', '360', '--states', selector)[0]?.file
    expect(fileOf('.card a')).toEqual(hashed('home-360-hover-card-a'))
    expect(fileOf('.card-a')).toEqual(hashed('home-360-hover-card-a'))
    expect(fileOf('.card a')).not.toBe(fileOf('.card-a'))
    const start = 'main section:nth-of-type(2) article:nth-of-type'
    expect(fileOf(`${start}(1) a`)).not.toBe(fileOf(`${start}(2) a`))
  })

  it('leaves no hyphen dangling where it cuts a long selector', () => {
    expect(
      files(
        '--only',
        '/',
        '--widths',
        '360',
        '--states',
        'main article a[href="/concepts/karma-yoga/xyz"]',
      )[0],
    ).toEqual(hashed('home-360-hover-main-article-a-href-concepts-karma-yoga'))
  })

  it('keeps a selector whole, commas and quotes included, and stops at an empty one', () => {
    const selector = 'nav a, main a[href="/concepts/"]'
    expect(plan('--only', '/', '--widths', '360', `--states=${selector}`)[0]).toMatchObject({
      selector,
      file: hashed('home-360-hover-nav-a-main-a-href-concepts'),
    })
    expect(() => plan('--states', '')).toThrow(/--states takes/)
    expect(() => plan('--states')).toThrow(/--states takes/)
    expect(() => plan('--states=  ')).toThrow(/--states takes/)
  })

  it('shoots the states with and without motion under --both', () => {
    expect(
      files('--only', '/concepts/vikshepa/', '--widths', '1440', '--both', '--states', 'main a'),
    ).toEqual([
      hashed('concepts-vikshepa-1440-hover-main-a'),
      hashed('concepts-vikshepa-1440-focus-visible-main-a'),
      hashed('concepts-vikshepa-1440-active-main-a'),
      hashed('concepts-vikshepa-1440-reduced-hover-main-a'),
      hashed('concepts-vikshepa-1440-reduced-focus-visible-main-a'),
      hashed('concepts-vikshepa-1440-reduced-active-main-a'),
    ])
  })

  it('names a selector with no letters or digits by its hash alone', () => {
    expect(files('--only', '/', '--widths', '360', '--states', '*')).toEqual([
      hashed('home-360-hover'),
      hashed('home-360-focus-visible'),
      hashed('home-360-active'),
    ])
    expect(files('--only', '/', '--widths', '360', '--states', '#')[0]).toEqual(
      hashed('home-360-hover'),
    )
  })

  it('stops at an option it doesn’t know', () => {
    expect(() => shots.parseArgs(['--fullpage'])).toThrow(/Unknown option: --fullpage/)
    expect(() => shots.parseArgs(['/'])).toThrow(/Unknown option: \//)
  })
})

describe('pnpm shots over the route registry', () => {
  let routes: readonly RouteEntry[]
  beforeAll(async () => {
    routes = await site.routes()
  })

  it('shoots one route of each kind in this build, at two widths', () => {
    const planned = shots.planShots(shots.parseArgs([]), routes)
    const kinds = new Set(routes.map((entry) => entry.kind))
    const kindOf = (path: string) => routes.find((entry) => entry.path === path)?.kind
    expect(new Set(planned.map((shot) => kindOf(shot.path)))).toEqual(kinds)
    expect(planned).toHaveLength(kinds.size * 2)
  })

  it('gives every route a file of its own', () => {
    const everyPath = routes.map((entry) => entry.path).join(',')
    const names = shots.planShots(shots.parseArgs(['--only', everyPath, '--widths', '360']), routes)
    expect(names).toHaveLength(routes.length)
    expect(new Set(names.map((shot) => shot.file)).size).toBe(routes.length)
  })
})

describe('pnpm shots loading the route registry itself', () => {
  // The command has its own loader, outside Vitest's aliases, so it needs a test of its own.
  it('reads the same routes the site has', async () => {
    const loaded = await shots.loadRoutes()
    expect(loaded.map((entry) => entry.path)).toEqual(
      (await site.routes()).map((entry) => entry.path),
    )
  })
})

describe('pnpm shots on a server already running', () => {
  let server: Server
  let port: number

  beforeAll(async () => {
    // A stand-in for `pnpm start`: it serves the build manifest of build "ours" only.
    server = createServer((request, response) => {
      response.statusCode = request.url === '/_next/static/ours/_buildManifest.js' ? 200 : 404
      response.end()
    })
    await new Promise<void>((done) => server.listen(0, 'localhost', done))
    port = (server.address() as AddressInfo).port
  })
  afterAll(() => new Promise<void>((done) => server.close(() => done())))

  it('says when it is this checkout’s build', async () => {
    const said = await shots.describeServer(port, 'ours')
    expect(said).toContain(`port ${port}`)
    expect(said).toMatch(/this checkout’s build \(ours\)/)
  })

  it('warns when it is another build', async () => {
    expect(await shots.describeServer(port, 'theirs')).toMatch(/not this checkout’s build/)
  })

  it('warns when this checkout has no build', async () => {
    expect(await shots.describeServer(port, null)).toMatch(/not this checkout’s build/)
  })
})
