// Lighthouse CI: lab checks for NFR-02 on a mobile profile (Lighthouse's default throttling).
// Lighthouse cannot measure INP, so Total Blocking Time stands in for it.
// Node's own module, without require(), which the lint rules refuse.
const { spawnSync } = process.getBuiltinModule('node:child_process')

// Lanes (tickets built in their own worktrees) audit side by side on one machine, each its own
// server on its own port (README.md, "Checks").
const PORT = port()
// Lighthouse won't audit a page that answers 404, so the 404 page is covered by Playwright instead.
const paths = ['/', '/concepts/vikshepa', '/questionnaires/karmayoga-scale']

function port() {
  const value = process.env.LHCI_PORT || '3200'
  if (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 65_535) return Number(value)
  throw new Error(`LHCI_PORT must be a port number, such as 3210, not “${value}”.`)
}

/**
 * Collect starts its own server, and would audit whatever already answers on a
 * taken port: another lane's build. So it stops first, naming the port.
 */
function stopIfTaken(port) {
  const probe = `
    const net = require('node:net')
    const answers = (host) =>
      new Promise((done) => {
        const socket = net.connect({ port: ${port}, host })
        socket.once('connect', () => {
          socket.destroy()
          done(true)
        })
        socket.once('error', () => done(false))
      })
    Promise.all([answers('127.0.0.1'), answers('::1')]).then((taken) =>
      process.exit(taken.includes(true) ? 1 : 0),
    )
  `
  const { status } = spawnSync(process.execPath, ['-e', probe], { timeout: 10_000 })
  if (status === 0) return
  throw new Error(
    status === 1
      ? `Port ${port} is already in use, so Lighthouse would audit whatever is listening there. Free it (fuser -k ${port}/tcp) or set another LHCI_PORT.`
      : `Couldn't check whether port ${port} is free.`,
  )
}

if (process.argv[2] === 'collect') stopIfTaken(PORT)

module.exports = {
  ci: {
    collect: {
      startServerCommand: `pnpm start -p ${PORT}`,
      // Next.js prints "✓ Ready in 234ms" once it listens. Matched as a whole word (the pattern
      // ignores case), since "address already in use" must not count as ready.
      startServerReadyPattern: '\\bReady in\\b',
      url: paths.map((path) => `http://localhost:${PORT}${path}`),
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'largest-contentful-paint': [
          'error',
          { maxNumericValue: 2500, aggregationMethod: 'median-run' },
        ],
        'cumulative-layout-shift': [
          'error',
          { maxNumericValue: 0.1, aggregationMethod: 'median-run' },
        ],
        'total-blocking-time': ['error', { maxNumericValue: 200, aggregationMethod: 'median-run' }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:performance': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      // Reports stay on the CI runner and are uploaded as a build artifact, never published.
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
