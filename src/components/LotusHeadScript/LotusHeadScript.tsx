import { LOTUS_MOTION_KEY, lotusMotionFrom } from '../lotus-motion'

/**
 * Runs in the browser, sent as its source, so it must not reach outside
 * itself: it is handed the decision and the key it reads.
 */
function markLotusMotion(decide: typeof lotusMotionFrom, key: string) {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(key)
  } catch {
    // Blocked storage throws on reading, and then the lotuses breathe.
  }
  document.documentElement.dataset.lotusMotion = decide(stored)
}

/**
 * Marks <html> with whether the lotuses breathe or keep still, from the
 * reader's stored choice. An inline script in the head, so the mark is there
 * before the first paint and a paused lotus never starts. Without JavaScript
 * there is no mark, and nothing breathes.
 */
export function LotusHeadScript() {
  const args = `${lotusMotionFrom},${JSON.stringify(LOTUS_MOTION_KEY)}`
  return <script dangerouslySetInnerHTML={{ __html: `(${markLotusMotion})(${args})` }} />
}
