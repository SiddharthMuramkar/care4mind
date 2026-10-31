import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'server-only': fileURLToPath(new URL('./tests/server-only.ts', import.meta.url)),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    // A record file changes the registry, and vitest on its own never writes it.
    globalSetup: ['./vitest.global-setup.ts'],
    environment: 'node',
    // The whole-content tests pass Vitest's 5 s default while three builders build at once.
    testTimeout: 30_000,
  },
})
