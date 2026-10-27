import type { LateFace } from '@/fonts/late-faces'

/**
 * Runs in the browser, sent as its source, so it must not reach outside
 * itself. Once the first text is painted, it adds each late face.
 */
function addAfterFirstPaint(faces: readonly LateFace[]) {
  const add = () => {
    for (const { family, url, descriptors, onDemand } of faces) {
      const face = new FontFace(family, `url(${url}) format('woff2')`, descriptors)
      if (onDemand) {
        document.fonts.add(face)
      } else {
        // A face that fails to load leaves its text in its stand-in.
        face
          .load()
          .then(() => document.fonts.add(face))
          .catch(() => {})
      }
    }
  }
  if (PerformanceObserver.supportedEntryTypes?.includes('paint')) {
    new PerformanceObserver((list, observer) => {
      if (list.getEntriesByName('first-contentful-paint').length === 0) return
      observer.disconnect()
      add()
    }).observe({ type: 'paint', buffered: true })
  } else {
    addEventListener('load', add, { once: true })
  }
}

/**
 * Ticket 05: the faces the first paint can do without load after it, so they
 * never hold up the text. An inline script, so it doesn't wait for the page's
 * JavaScript. Without JavaScript their text keeps its stand-in.
 */
export function LateFonts({ faces }: { faces: readonly LateFace[] }) {
  const args = JSON.stringify(faces).replace(/</g, '\\u003c')
  return <script dangerouslySetInnerHTML={{ __html: `(${addAfterFirstPaint})(${args})` }} />
}
