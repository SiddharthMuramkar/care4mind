import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { defineConfig, devices, type Project } from '@playwright/test'

import { e2eScope } from './tests/e2e/fixtures'

// Builders (tickets built in their own worktrees) test side by side on one machine, so each run's
// port and size come from the environment (README.md, "Checks"). A knob set to something it
// can't use stops the run before it starts.

/** A knob's value, or undefined when it is unset or empty. */
const knob = (name: string) => process.env[name] || undefined

function refuse(name: string, wants: string): never {
  throw new Error(`${name} must be ${wants}, not “${process.env[name]}”.`)
}

const isWhole = (value: string) => /^\d+$/.test(value)

function port() {
  const value = knob('E2E_PORT') ?? '3100'
  if (isWhole(value) && Number(value) >= 1 && Number(value) <= 65_535) return Number(value)
  return refuse('E2E_PORT', 'a port number, such as 3110')
}

function workers() {
  const value = knob('E2E_WORKERS') ?? '4'
  if (/^[1-9]\d*$/.test(value)) return Number(value)
  if (/^([1-9]\d?|100)%$/.test(value)) return value
  return refuse('E2E_WORKERS', 'a number of workers, or a share of the CPU cores such as 50%')
}

function retries() {
  const value = knob('E2E_RETRIES') ?? (process.env.CI ? '1' : '0')
  if (isWhole(value)) return Number(value)
  return refuse('E2E_RETRIES', 'a number of retries, such as 1')
}

/** E2E_REUSE=1 tests a server already on the port instead of starting one. */
function reuse() {
  const value = knob('E2E_REUSE') ?? '0'
  if (value === '0' || value === '1') return value === '1'
  return refuse('E2E_REUSE', '1 (test the server already on the port) or 0')
}

/** E2E_ONLY=concept,questionnaire runs only those spec files: a pattern matching every other one. */
function onlyIgnore() {
  const value = knob('E2E_ONLY')
  if (value === undefined) return undefined
  const specs = readdirSync(fileURLToPath(new URL('tests/e2e/', import.meta.url)))
    .filter((file) => file.endsWith('.spec.ts'))
    .map((file) => file.slice(0, -'.spec.ts'.length))
  const names = value.split(',').map((name) => name.trim())
  if (!names.every((name) => specs.includes(name))) {
    refuse('E2E_ONLY', `spec names from tests/e2e, comma-separated (${specs.join(', ')})`)
  }
  const listed = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  return new RegExp(`(?:^|/)(?!(?:${listed})\\.spec\\.ts$)[^/]+\\.spec\\.ts$`)
}

const PORT = port()
// The login stand-ins' ports, one and two above the site's, so builders' runs side by side don't meet.
const STAND_IN_PORT = PORT + 1
const DATABASE_PORT = PORT + 2
const ONLY = onlyIgnore()
e2eScope() // read by the specs that loop over routes; checked here so a typo stops the run at once

// Point the suite at a deployed preview with PLAYWRIGHT_BASE_URL; otherwise it starts the local production build.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

const chrome = devices['Desktop Chrome']

// A tagged test runs only where its tag belongs, instead of opening a page at every width just
// to skip: @one-width (its assertions read no layout) and @self-width (it sets its own viewport
// first) run at 360 alone, @only-360 below 600 px, @below-1440 under 80rem, @from-768 from
// 600 px and @from-1440 from 80rem (or checked once, at 1440 px). Untagged tests run at all three.
const notAt: Record<number, RegExp> = {
  360: /@from-768|@from-1440/,
  768: /@one-width|@self-width|@only-360|@from-1440/,
  1440: /@one-width|@self-width|@only-360|@below-1440/,
}

const widthProject = (width: number, height: number): Project => ({
  name: `chromium-${width}`,
  use: { ...chrome, viewport: { width, height } },
  grepInvert: notAt[width],
  testIgnore: [
    /motion\.spec\.ts/,
    /smoke\.spec\.ts/,
    /reflow\.spec\.ts/,
    /crawler\.spec\.ts/,
    /redirects\.spec\.ts/,
    /latency\.spec\.ts/,
  ],
})

const projects: Project[] = [
  // Every width from 360 to 1440 px, sampled at the three the site is designed for.
  widthProject(360, 800),
  widthProject(768, 1024),
  widthProject(1440, 900),
  // WCAG 1.4.10 Reflow: every route at 320 px, narrower than the narrowest width project; the spec sets its other widths.
  {
    name: 'reflow',
    use: { ...chrome, viewport: { width: 320, height: 640 } },
    testMatch: /reflow\.spec\.ts/,
  },
  // NFR-01 includes reduced motion.
  {
    name: 'reduced-motion',
    use: {
      ...chrome,
      viewport: { width: 360, height: 800 },
      contextOptions: { reducedMotion: 'reduce' },
    },
    testMatch: /motion\.spec\.ts/,
  },
  // NFR-04 and FR-07 are HTTP only (the link crawler reads the HTML the server sends, and a
  // redirect is an answer's status and Location), so they run once, at no width.
  {
    name: 'http',
    use: { viewport: null },
    testMatch: /(?:crawler|redirects)\.spec\.ts/,
  },
  // The CPU is slowed four times, so a second worker beside it would skew the timings.
  {
    name: 'latency',
    use: { ...chrome, viewport: { width: 360, height: 800 } },
    testMatch: /latency\.spec\.ts/,
  },
  // Firefox lacks scroll-driven animations and WebKit renders Devanagari with its own engine.
  {
    name: 'firefox-360',
    use: { ...devices['Desktop Firefox'], viewport: { width: 360, height: 800 } },
    testMatch: /smoke\.spec\.ts/,
  },
  // Playwright's WebKit needs Ubuntu's libraries, so it runs in CI only.
  ...(process.env.CI
    ? [
        {
          name: 'webkit-360',
          use: { ...devices['Desktop Safari'], viewport: { width: 360, height: 800 } },
          testMatch: /smoke\.spec\.ts/,
        },
      ]
    : []),
]

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  workers: workers(),
  retries: retries(),
  // CI runs the tests in shards and merges their blobs into one HTML report.
  reporter: process.env.CI ? [['github'], ['blob']] : 'list',
  use: {
    baseURL,
    // A failed run keeps its trace, and so does each retry, even one that passes.
    trace: 'retain-on-failure-and-retries',
    ...(bypass && {
      extraHTTPHeaders: {
        'x-vercel-protection-bypass': bypass,
        'x-vercel-set-bypass-cookie': 'true',
      },
    }),
  },
  projects: ONLY
    ? projects.map((project) => ({
        ...project,
        testIgnore: [project.testIgnore ?? [], ONLY].flat(),
      }))
    : projects,
  globalSetup: './tests/e2e/global-setup.ts',
  ...(!process.env.PLAYWRIGHT_BASE_URL && {
    webServer: [
      {
        // Postgres, Brevo and Cloudflare's token check, on this machine only (login-stand-ins.mjs).
        command: `pnpm exec node tests/e2e/login-stand-ins.mjs ${DATABASE_PORT} ${STAND_IN_PORT}`,
        port: STAND_IN_PORT,
        reuseExistingServer: reuse(),
        timeout: 60_000,
      },
      {
        command: `pnpm start -p ${PORT}`,
        // By port, so anything already listening there counts, not only a server that answers.
        port: PORT,
        // Each run starts its own server. If the port is taken the run stops at once, naming it
        // ("http://localhost:3110 is already used"), rather than test another builder's server.
        reuseExistingServer: reuse(),
        timeout: 120_000,
        env: {
          BETTER_AUTH_URL: baseURL,
          // Signs user-sessions in this throwaway database only.
          BETTER_AUTH_SECRET: 'browser-tests-only-this-signs-nothing-real',
          DATABASE_URL: `postgres://postgres:postgres@127.0.0.1:${DATABASE_PORT}/postgres`,
          // Cloudflare's published test secret: it can only pass tokens made with its test site key.
          TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
          TURNSTILE_VERIFY_URL: `http://127.0.0.1:${STAND_IN_PORT}/turnstile/v0/siteverify`,
          // Google's token endpoint is faked in this server's own process (google-stand-in.mjs).
          NODE_OPTIONS: `--import=${fileURLToPath(new URL('tests/e2e/google-stand-in.mjs', import.meta.url))}`,
          GOOGLE_CLIENT_ID: 'browser-tests-only',
          GOOGLE_CLIENT_SECRET: 'browser-tests-only',
          BREVO_API_KEY: 'browser-tests-only',
          BREVO_API_URL: `http://127.0.0.1:${STAND_IN_PORT}/v3/smtp/email`,
          LOGIN_EMAIL_FROM: 'login@care4mind.test',
          LOGIN_ALERT_EMAIL: 'developer@care4mind.test',
        },
      },
    ],
  }),
})
