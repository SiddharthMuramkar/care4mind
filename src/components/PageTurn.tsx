import { ViewTransition, type ReactNode } from 'react'

/** A Link's transitionTypes: deeper into the site turns the page forward, a breadcrumb turns it back. */
export const turnForward = ['turn-forward']
export const turnBack = ['turn-back']

// Each type is also the class of its animation (globals.css). Untyped page
// changes, such as the browser's own back and forward, swap the page at once.
const turn = { 'turn-forward': 'turn-forward', 'turn-back': 'turn-back', default: 'none' }

/**
 * Wraps a page's main content, so that a link with a turn type turns the page
 * forward or back. The header and footer sit outside it and stay still, and
 * named elements inside it (a Concept's title) still fly to their new place.
 */
export function PageTurn({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={turn} exit={turn} default="none">
      {children}
    </ViewTransition>
  )
}
