import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

// The migration's counts and per-record restatements. verify runs this config. pnpm check does
// not: a new record must not have to edit these tests.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/fidelity/**/*.test.ts'],
    globalSetup: ['./vitest.global-setup.ts'],
    environment: 'node',
    testTimeout: 30_000,
  },
})
