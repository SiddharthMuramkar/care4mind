import { defineConfig } from 'vitest/config'

import unit from './vitest.config'

// The unit suite's setup, over the migration's facts instead; mergeConfig would join the includes.
export default defineConfig({
  ...unit,
  test: { ...unit.test, include: ['tests/fidelity/**/*.test.ts'] },
})
