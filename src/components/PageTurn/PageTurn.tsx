import { ViewTransition, type ReactNode } from 'react'

/** A page turn's direction, named by its animation's class (globals.css). */
export type Turn = 'turn-forward' | 'turn-back'

/** A Link's transitionTypes: deeper into the site turns the page forward, a breadcrumb turns it back. */
export const turnForward: Turn[] = ['turn-forward']
export const turnBack: Turn[] = ['turn-back']

// Each turn is also the class of its animation (globals.css). Untyped page
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

/** The kinds of title that fly from a card or a link into a page's heading. */
export type TitleMorphKind = 'concept' | 'questionnaire' | 'topic' | 'work'

/**
 * A title that flies into its page's heading as the page turns. Its shared
 * name is spelled here alone, so the two ends of the flight — a card and a
 * heading naming the same kind and slug — can never drift apart.
 */
export function TitleMorph({
  kind,
  slug,
  children,
}: {
  kind: TitleMorphKind
  slug: string
  children: ReactNode
}) {
  return (
    <ViewTransition name={`${kind}-title-${slug}`} share="morph" default="none">
      {children}
    </ViewTransition>
  )
}
