import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
// Point the suite at a deployed preview with PLAYWRIGHT_BASE_URL; otherwise it starts the local production build.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

const chrome = devices['Desktop Chrome']
const widthProject = (width: number, height: number) => ({
  name: `chromium-${width}`,
  use: { ...chrome, viewport: { width, height } },
  testIgnore: [/motion\.spec\.ts/, /smoke\.spec\.ts/, /reflow\.spec\.ts/],
})

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    ...(bypass && {
      extraHTTPHeaders: {
        'x-vercel-protection-bypass': bypass,
        'x-vercel-set-bypass-cookie': 'true',
      },
    }),
  },
  projects: [
    // FR-06: every width from 360 to 1440 px, sampled at the three the site is designed for.
    widthProject(360, 800),
    widthProject(768, 1024),
    widthProject(1440, 900),
    // WCAG 1.4.10 Reflow tests at 320 px, narrower than FR-06.
    {
      name: 'reflow-320',
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
    // Firefox lacks scroll-driven animations and WebKit renders Devanagari with its own engine.
    {
      name: 'firefox-360',
      use: { ...devices['Desktop Firefox'], viewport: { width: 360, height: 800 } },
      testMatch: /smoke\.spec\.ts/,
    },
    {
      name: 'webkit-360',
      use: { ...devices['Desktop Safari'], viewport: { width: 360, height: 800 } },
      testMatch: /smoke\.spec\.ts/,
    },
  ],
  ...(!process.env.PLAYWRIGHT_BASE_URL && {
    webServer: {
      command: `pnpm start -p ${PORT}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  }),
})
