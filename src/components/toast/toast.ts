/** What a toast says: a short confirmation, such as "Copied", and what it was about. */
export interface ToastMessage {
  /** The message itself, in a word or two: "Copied". */
  title: string
  /** A second line, such as what was copied: "Yoga Sūtra 1.30". */
  description?: string
}

type Show = (message: ToastMessage) => void

const waiting: ToastMessage[] = []
let show: Show | undefined
let wake: (() => void) | undefined

/**
 * Confirm something in a toast, the site's one way to say "done" (front-end-site ticket 04):
 * "Copy verse" and "Copy citation" call it. It is announced politely, never takes focus,
 * stays at least 5 seconds (longer while pointed at or focused) and can be dismissed. Call it
 * from the browser; the toasts' code loads with the first one.
 */
export function toast(message: string | ToastMessage): void {
  const next = typeof message === 'string' ? { title: message } : message
  if (show) {
    show(next)
    return
  }
  waiting.push(next)
  wake?.()
}

/** For the layout's Toaster: called when a toast is first wanted. */
export function onFirstToast(callback: () => void): () => void {
  wake = callback
  if (waiting.length > 0) callback()
  return () => {
    if (wake === callback) wake = undefined
  }
}

/** For the toasts' viewport, once it is on the page: shows what waited, then each new toast. */
export function connectToasts(next: Show): () => void {
  show = next
  for (const message of waiting.splice(0)) next(message)
  return () => {
    if (show === next) show = undefined
  }
}
