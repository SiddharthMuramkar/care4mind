// Lighthouse CI: lab checks for NFR-02 on a mobile profile (Lighthouse's default throttling).
// Lighthouse cannot measure INP, so Total Blocking Time stands in for it.
const PORT = 3200
// Lighthouse won't audit a page that answers 404, so the 404 page is covered by Playwright instead.
const paths = ['/', '/directions/press', '/directions/chroma', '/directions/kolam']

module.exports = {
  ci: {
    collect: {
      startServerCommand: `pnpm start -p ${PORT}`,
      startServerReadyPattern: 'Ready',
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
