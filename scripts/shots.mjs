#!/usr/bin/env node
// @ts-check
// Screenshots of the built site, one page of each kind, so every builder,
// review and finish looks at the site the same way. It prints each file it wrote, and nothing
// else, on stdout, so an agent can open exactly those.
//
//   pnpm shots [--only <paths or kinds>] [--widths <px,…>] [--full] [--reduced | --both]
//              [--states <selector>]
//   SHOTS_PORT=3120 pnpm shots --only /,concept
//   pnpm shots --only / --widths 360,768,1440 --states 'main article a'
//
// The routes come from the route registry (`site.routes()`), the parts with no browser are
// tested in tests/unit/shots.test.ts, the states and the wait for pictures in
// tests/e2e/shots.spec.ts, and Playwright, which the repo has, takes the pictures.

import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { connect } from 'node:net'
import { dirname, join, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, '.shots')
const WIDTHS = [360, 1440]
/** Pages shot at once. */
const AT_ONCE = 4
/** What `--states` shoots an element in, each named for its CSS pseudo-class. */
const STATES = ['hover', 'focus-visible', 'active']
/** Longer than the site's slowest hover: a preview opens 450 ms after the pointer arrives. */
const STATE_PAUSE = 700
/** How long a hover waits for its element to be under the pointer. */
const HOVER_WAIT = 5_000
/** How long a shot waits for its pictures, which the image optimizer can make slow. */
const PICTURE_WAIT = 20_000

const USAGE = `Usage: pnpm shots [options]

Screenshots of the built site as JPEGs in .shots/: each sample route of the route registry (one
page of each kind) at 360 and 1440 px, the screen's worth only, with motion. It prints the path
of each file it wrote, one per line.

  --only <paths or kinds>  only these routes, comma-separated: route paths (/concepts/vikshepa/)
                           or kinds (concept, the kind's sample route), such as --only /,concept
  --widths <px,…>          these widths instead, such as --widths 320,768
  --full                   whole pages, not just the screen's worth
  --reduced                with reduced motion
  --both                   each page with motion and with reduced motion
  --states <selector>      instead of the plain shots, the first visible element matching this
                           CSS selector in its hover, focus-visible and active states, three shots
                           each, the screen's worth with the element centred (--full doesn't
                           apply), such as --only / --widths 360,768,1440 --states 'main article a'.
                           A page where it can't reach a state stops the command
  --help                   this

SHOTS_PORT (default 3100): it shoots the server listening there, and says on stderr whether that
server serves this checkout's build; if none is, it starts the build there (pnpm start) and stops
it afterwards.`

/** A mistake on the command line: the command says what it takes and stops. */
export class UsageError extends Error {}

/** The command line, as options. */
export function parseArgs(argv) {
  const options = { full: false, reduced: 'off', only: null, widths: WIDTHS, states: null }
  for (let index = 0; index < argv.length; index += 1) {
    const [name, inline] = argv[index].split(/=(.*)/s)
    // An option's value follows it, or its = sign.
    const value = () => inline ?? argv[(index += 1)] ?? ''
    if (name === '--only') options.only = list(value())
    else if (name === '--widths') options.widths = widths(value())
    else if (name === '--states') options.states = oneSelector(value())
    else if (name === '--full' && inline === undefined) options.full = true
    else if (name === '--reduced' && inline === undefined) options.reduced = 'on'
    else if (name === '--both' && inline === undefined) options.reduced = 'both'
    else throw new UsageError(`Unknown option: ${argv[index]}`)
  }
  return options
}

/** A comma-separated list's items, trimmed, without empty ones. */
const list = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

/** `--widths`: whole pixels, each once. */
function widths(value) {
  const items = list(value)
  const wrong = items.find((item) => !/^[1-9]\d{0,3}$/.test(item))
  if (items.length === 0 || wrong !== undefined) {
    throw new UsageError(
      `--widths takes screen widths in pixels, comma-separated, such as --widths 320,768` +
        (wrong === undefined ? '.' : `, not “${wrong}”.`),
    )
  }
  return [...new Set(items.map(Number))]
}

/** `--states`: one CSS selector, whole, since a comma is legal in one. */
function oneSelector(value) {
  const trimmed = value.trim()
  if (trimmed !== '') return trimmed
  throw new UsageError(`--states takes one CSS selector, such as --states 'main article a'.`)
}

/** How tall the screen is at a width: a phone's, a tablet's held upright, or a laptop's. */
function heightFor(width) {
  if (width < 768) return 800
  if (width < 1024) return 1024
  return 900
}

/**
 * A shot's file: the path's parts joined by hyphens (`home` for `/`), its width and motion, and
 * for a state its name, the selector's letters and digits to read, and a short hash of the exact
 * selector, so runs on one page with different selectors don't share a file.
 */
function fileFor(path, width, reducedMotion, state, selector) {
  const slug = path.split('/').filter(Boolean).join('-') || 'home'
  const named = selector
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
    .replace(/^-|-$/g, '')
  const hash = selector && createHash('sha256').update(selector).digest('hex').slice(0, 6)
  const parts = [slug, width, reducedMotion && 'reduced', state, named, hash]
  return `${parts.filter(Boolean).join('-')}.jpg`
}

/**
 * The routes `--only` names, in the registry's order: a path (with or without its trailing
 * slash) is that page, a kind is its sample route. Without `--only`, every sample route.
 */
function pick(only, routes) {
  if (only === null) return routes.filter((route) => route.sample)
  const kinds = [...new Set(routes.map((route) => route.kind))]
  const example = routes.find((route) => route.path !== '/')?.path ?? '/'
  const takes =
    `--only takes route paths or kinds, comma-separated: a page’s path in the route registry, ` +
    `such as ${example}, or one of its kinds: ${kinds.join(', ')}. The registry holds this ` +
    `build’s routes, so a feature switched off (FEATURE_*) has none.`
  if (only.length === 0) throw new UsageError(takes)
  const wanted = new Set()
  for (const item of only) {
    const path = item.startsWith('/') ? item.replace(/\/?$/, '/') : null
    const found = path
      ? routes.find((route) => route.path === path)
      : routes.find((route) => route.kind === item && route.sample)
    if (!found) throw new UsageError(`“${item}” is no route path or kind here. ${takes}`)
    wanted.add(found)
  }
  return routes.filter((route) => wanted.has(route))
}

/** Every shot the options ask for, route by route in the registry's order. */
export function planShots(options, routes) {
  const picked = pick(options.only, routes)
  const motions = { off: [false], on: [true], both: [false, true] }[options.reduced]
  const selector = options.states
  const states = selector === null ? [undefined] : STATES
  return picked.flatMap((route) =>
    options.widths.flatMap((width) =>
      motions.flatMap((reducedMotion) =>
        states.map((state) => ({
          path: route.path,
          width,
          height: heightFor(width),
          reducedMotion,
          full: options.full && state === undefined,
          file: fileFor(route.path, width, reducedMotion, state, selector ?? ''),
          ...(state === undefined ? {} : { state, selector }),
        })),
      ),
    ),
  )
}

/** SHOTS_PORT: the port of the server to shoot, or to start one on. */
function shotsPort(value = '3100') {
  if (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 65_535) return Number(value)
  throw new UsageError(`SHOTS_PORT must be a port number, such as 3120, not “${value}”.`)
}

/**
 * The route registry, for this run's feature flags. It is TypeScript behind the `@/content`
 * alias, which plain Node can't load, so Vite (the unit tests' loader) loads it, taking the
 * alias from tsconfig.json. Plain Node has no React Server condition, so the real `server-only`
 * marker would throw here, and the tsconfig path doesn't reach a bare import Vite's runner leaves
 * external: the alias does. The registry reads its records lazily and Vite's runner closes once
 * its import ends, so the routes are read within that import: a two-line module made here.
 */
export async function loadRoutes() {
  if (!existsSync(join(ROOT, 'src/content/generated/registry.ts'))) {
    throw new Error(
      'The content registry is missing: run node scripts/content/registry.mjs (pnpm build runs it).',
    )
  }
  const { runnerImport } = await import('vite')
  const id = 'virtual:shots-routes'
  const content = JSON.stringify(join(ROOT, 'src/content/index.ts'))
  const { module } = await runnerImport(id, {
    root: ROOT,
    logLevel: 'silent',
    resolve: { tsconfigPaths: true, alias: { 'server-only': join(ROOT, 'tests/server-only.ts') } },
    plugins: [
      {
        name: 'shots-routes',
        resolveId: (source) => (source === id ? `\0${id}` : undefined),
        load: (key) =>
          key === `\0${id}`
            ? `import { site } from ${content}\nexport default await site.routes()`
            : undefined,
      },
    ],
  })
  return module.default
}

/** Whether a server listens on the port. */
function listening(port) {
  return new Promise((resolve) => {
    const socket = connect({ port, host: 'localhost' })
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
  })
}

/** This checkout's production build, by its ID, or null when there is none. */
function buildId() {
  const file = join(ROOT, '.next', 'BUILD_ID')
  return existsSync(file) ? readFileSync(file, 'utf8').trim() : null
}

/**
 * Which build the server on the port serves, said in a line: a build serves its manifest under its
 * own ID, so another checkout's server, or an older build, answers 404 for this one's.
 */
export async function describeServer(port, id) {
  const ours =
    id !== null &&
    (await fetch(`http://localhost:${port}/_next/static/${id}/_buildManifest.js`).then(
      (response) => response.ok,
      () => false,
    ))
  return ours
    ? `Shooting the server already on port ${port}: this checkout’s build (${id}).`
    : `Shooting the server already on port ${port}, which is not this checkout’s build: ` +
        'another checkout’s, or an older one. Stop it, or pick another SHOTS_PORT.'
}

/**
 * Start the build on the port. `ready()` waits until it answers; `stop()` ends it and everything
 * it started (its own process group), and waits until the port is free.
 */
function startServer(port) {
  const server = spawn('pnpm', ['start', '-p', String(port)], {
    cwd: ROOT,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  const keep = (chunk) => (output = (output + chunk).slice(-4000))
  server.stdout.on('data', keep)
  server.stderr.on('data', keep)
  let failed = null
  server.once('error', (error) => (failed = error))
  const running = () => failed === null && server.exitCode === null && server.signalCode === null
  const signal = (name) => {
    try {
      if (server.pid !== undefined) process.kill(-server.pid, name)
    } catch {
      // Already gone.
    }
  }
  return {
    async ready() {
      for (let waited = 0; !(await listening(port)); waited += 200) {
        if (!running() || waited > 60_000) {
          throw new Error(
            `pnpm start -p ${port} didn’t serve the site${failed ? `: ${failed.message}` : ''}.\n${output.trim()}`,
          )
        }
        await delay(200)
      }
    },
    async stop() {
      if (server.pid === undefined) return
      signal('SIGTERM')
      for (let waited = 0; running() || (await listening(port)); waited += 100) {
        if (waited === 5_000) signal('SIGKILL')
        if (waited > 10_000) break
        await delay(100)
      }
    },
    /** Last resort, when the command itself is ending: no waiting. */
    kill: () => running() && signal('SIGKILL'),
  }
}

/**
 * Wait until the page is as a reader sees it: hydrated (as gotoReady() waits), its fonts loaded
 * (the faces LateFonts adds after the first paint come over the network) and its opening
 * drawings finished. Drawings on the scroll's timeline stay where the scroll has them.
 */
async function ready(page, path) {
  await page
    .locator('html[data-hydrated]')
    .waitFor({ state: 'attached', timeout: 15_000 })
    .catch(() => {
      throw new Error(`${path} didn’t hydrate within 15 s (html[data-hydrated] never appeared).`)
    })
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {})
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await animationsDone(page)
}

/** Wait for the running animations and transitions that end. Scroll-driven ones never do. */
async function animationsDone(page) {
  await page.evaluate(async () => {
    const running = document
      .getAnimations()
      .filter(
        (animation) =>
          animation.timeline === document.timeline &&
          animation.playState === 'running' &&
          Number.isFinite(animation.effect?.getComputedTiming().endTime ?? Infinity),
      )
    await Promise.race([
      Promise.allSettled(running.map((animation) => animation.finished)),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ])
  })
}

/**
 * Load every picture, lazy ones included, and wait until each has decoded or failed: a lazy
 * picture far off the screen is otherwise never requested, and shows as a blank. Past the time
 * limit it says so on stderr and lets the shot go ahead.
 */
export async function picturesDone(page, path) {
  const finished = await page.evaluate(async (limit) => {
    const pictures = [...document.images]
    for (const picture of pictures) if (picture.loading === 'lazy') picture.loading = 'eager'
    return Promise.race([
      Promise.allSettled(pictures.map((picture) => picture.decode())).then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), limit)),
    ])
  }, PICTURE_WAIT)
  if (!finished) {
    console.error(
      `pnpm shots: pictures on ${path} were still loading after ${PICTURE_WAIT / 1000} s, so the shot may show blanks.`,
    )
  }
}

/**
 * Put the shot's element in its state, in the middle of the screen, clear of the sticky header,
 * and see that it got there, so nobody judges a picture of the wrong state. A pressed mouse is
 * never released: the context closes first, so a link doesn't navigate.
 */
export async function enterState(page, { path, selector, state }) {
  const target = page.locator(selector).visible().first()
  if ((await target.count()) === 0) {
    throw new Error(`No visible element on ${path} matches “${selector}”.`)
  }
  await target.evaluate((element) => {
    // The page scrolls smoothly, which would still be moving when the state is entered.
    document.documentElement.style.scrollBehavior = 'auto'
    element.scrollIntoView({ block: 'center', behavior: 'instant' })
  })
  if (state === 'focus-visible') await target.focus()
  else {
    await target.hover({ timeout: HOVER_WAIT }).catch(() => {
      throw new Error(
        `“${selector}” on ${path} couldn’t be hovered within ${HOVER_WAIT / 1000} s: its first ` +
          'visible match is covered or off the screen. Narrow the selector.',
      )
    })
  }
  if (state === 'active') await page.mouse.down()
  await delay(STATE_PAUSE)
  await animationsDone(page)
  const pseudo = `:${state}`
  if (!(await target.evaluate((element, name) => element.matches(name), pseudo))) {
    throw new Error(
      `“${selector}” on ${path} never became ${pseudo}. Can it be hovered, focused and pressed?`,
    )
  }
}

/** Take one shot in a fresh browser context; the file it wrote. */
async function take(browser, baseURL, shot) {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: shot.width, height: shot.height },
    reducedMotion: shot.reducedMotion ? 'reduce' : 'no-preference',
  })
  try {
    const page = await context.newPage()
    const response = await page.goto(shot.path)
    if (!response?.ok()) {
      const status = response?.status() ?? 'nothing'
      const flags =
        status === 404 ? ': was the build made with this run’s FEATURE_* variables?' : '.'
      throw new Error(`${baseURL}${shot.path} answered ${status}${flags}`)
    }
    await ready(page, shot.path)
    if (shot.state !== undefined) await enterState(page, shot)
    await picturesDone(page, shot.path)
    await animationsDone(page)
    const file = join(OUT, shot.file)
    await page.screenshot({ path: file, type: 'jpeg', quality: 70, fullPage: shot.full })
    return file
  } finally {
    await context.close()
  }
}

/**
 * Take every shot, a few at once, printing each file in the plan's order as it lands. At the
 * first failure it starts no more, prints what it wrote and throws.
 */
async function shootAll(shots, baseURL) {
  const { chromium } = await import('@playwright/test')
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const written = []
  let printed = 0
  let next = 0
  let failure = null
  const print = () => {
    while (printed < shots.length && written[printed]) console.log(written[(printed += 1) - 1])
  }
  const worker = async () => {
    while (failure === null && next < shots.length) {
      const index = next
      next += 1
      try {
        written[index] = await take(browser, baseURL, shots[index])
        print()
      } catch (error) {
        failure ??= error
      }
    }
  }
  try {
    await Promise.all(Array.from({ length: Math.min(AT_ONCE, shots.length) }, worker))
  } finally {
    await browser.close()
  }
  if (failure !== null) {
    for (const file of written.slice(printed)) if (file) console.log(file)
    throw failure
  }
}

async function main(argv) {
  if (argv.includes('--help')) {
    console.log(USAGE)
    return
  }
  const options = parseArgs(argv)
  const port = shotsPort(process.env.SHOTS_PORT || undefined)
  const serving = await listening(port)
  if (serving) console.error(`pnpm shots: ${await describeServer(port, buildId())}`)
  if (!serving && buildId() === null) {
    throw new Error(
      `Nothing listens on port ${port}, and there is no build to start there (.next/ holds none). ` +
        'Run pnpm build first.',
    )
  }
  const shots = planShots(options, await loadRoutes())
  const server = serving ? null : startServer(port)
  // Ctrl-C stops the server too, even while it starts: it runs in its own process group.
  const stop = (signal) => {
    void (server?.stop() ?? Promise.resolve()).finally(() =>
      process.exit(signal === 'SIGINT' ? 130 : 143),
    )
  }
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
  process.once('exit', () => server?.kill())
  try {
    await server?.ready()
    await shootAll(shots, `http://localhost:${port}`)
  } finally {
    await server?.stop()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => {
    const usage = error instanceof UsageError
    console.error(`pnpm shots: ${error.message}${usage ? `\n\n${USAGE}` : ''}`)
    process.exitCode = usage ? 2 : 1
  })
}
