// Lighthouse CI: lab checks for NFR-02 on a mobile profile (Lighthouse's default throttling).
// Lighthouse cannot measure INP, so Total Blocking Time stands in for it.
// Node's own module, without require(), which the lint rules refuse.
const { spawnSync } = process.getBuiltinModule('node:child_process')

// Vercel serves visitors HTTP/2 over TLS, and Lighthouse's simulated slow 4G models it apart
// from plain HTTP/1.1: one connection carrying every file in turn, at the whole bandwidth,
// instead of six that each wait for their own handshake and share it. So by default the build is
// served as visitors get it: next start behind scripts/lhci/h2-server.mjs, which answers on PORT
// over HTTP/2 with TLS and puts next start on the port after. LHCI_HTTP=1.1 serves it from
// next start alone, plain HTTP/1.1 on PORT, to compare.
const H2 = protocol() === '2'
// Builders (tickets built in their own worktrees) audit side by side on one machine, each its own
// server on its own port (README.md, "Checks").
const PORT = port()
// Lighthouse won't audit a page that answers 404, so the 404 page is covered by Playwright instead.
const paths = ['/', '/concepts/vikshepa/', '/questionnaires/karmayoga-scale/']

function protocol() {
  const value = process.env.LHCI_HTTP || '2'
  if (value === '2' || value === '1.1') return value
  throw new Error(`LHCI_HTTP must be 2 (HTTP/2 with TLS, the default) or 1.1, not “${value}”.`)
}

function port() {
  const value = process.env.LHCI_PORT || '3200'
  // Over HTTP/2, next start takes the port after it.
  const highest = H2 ? 65_534 : 65_535
  if (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= highest) return Number(value)
  throw new Error(
    `LHCI_PORT must be a port number from 1 to ${highest}, such as 3210, not “${value}”.`,
  )
}

/**
 * Collect starts its own server, and would audit whatever already answers on a
 * taken port: another builder's build. So it stops first, naming the port.
 */
function stopIfTaken(port, so = 'Lighthouse would audit whatever is listening there') {
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
      ? `Port ${port} is already in use, so ${so}. Free it (fuser -k ${port}/tcp) or set another LHCI_PORT.`
      : `Couldn't check whether port ${port} is free.`,
  )
}

if (process.argv[2] === 'collect') {
  stopIfTaken(PORT)
  if (H2)
    stopIfTaken(PORT + 1, `next start couldn't listen there, behind the HTTP/2 server on ${PORT}`)
}

module.exports = {
  ci: {
    collect: {
      startServerCommand: H2 ? `node scripts/lhci/h2-server.mjs ${PORT}` : `pnpm start -p ${PORT}`,
      // Next.js prints "✓ Ready in 234ms" once it listens, and h2-server.mjs the same once both
      // its servers do. Matched as a whole word (the pattern ignores case), since "address
      // already in use" must not count as ready.
      startServerReadyPattern: '\\bReady in\\b',
      url: paths.map((path) => `${H2 ? 'https' : 'http'}://localhost:${PORT}${path}`),
      // The certificate is self-signed, which Chrome would refuse. Every Lighthouse setting,
      // throttling included, stays its default.
      ...(H2 && { settings: { chromeFlags: '--ignore-certificate-errors' } }),
      // Five runs. TBT is the median of those runs, so one garbage-collection pause
      // cannot fail the 200 ms budget. LCP and CLS stay on the representative run:
      // a pause shows up as blocking time, not as layout shift, and LCP's 2.5 s
      // budget is not the one a cold run has been failing.
      numberOfRuns: 5,
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
        // Median of the five TBT values. The others stay on the representative run.
        'total-blocking-time': ['error', { maxNumericValue: 200, aggregationMethod: 'median' }],
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
