// Style tiles only (ticket 21, Step 1): deleted with src/app/directions.
import { describe, expect, it } from 'vitest'

import { directions } from '@/app/directions/_shared/directions'
import { CONTRAST_PAIRS, contrastRatio } from '@/lib/contrast'

describe('style-tile palettes meet WCAG 2.2 AA contrast', () => {
  for (const direction of directions) {
    for (const pair of CONTRAST_PAIRS) {
      it(`${direction.name}: ${pair.foreground} on ${pair.background} ≥ ${pair.minimum}:1`, () => {
        expect(
          contrastRatio(direction.palette[pair.foreground], direction.palette[pair.background]),
        ).toBeGreaterThanOrEqual(pair.minimum)
      })
    }
  }
})
