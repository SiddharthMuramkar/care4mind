import type { ReactNode } from 'react'

export interface ScriptPreferenceProps {
  /**
   * `header`: in the header's strip, shown from 72rem up, with room for a control about 48 px
   * wide (name it with aria-label; the Drawer has room for its words). `drawer`: in the Menu's
   * sheet, where a ProposalNote belongs beside it.
   */
  placement: 'header' | 'drawer'
}

/**
 * Slot, added by front-end-site ticket 04 and filled by ticket 13: the site-wide "Devanagari
 * first" toggle. The shell mounts it only while `features.devanagariFirst` is on, so it never
 * reads the flag itself. This stub renders nothing.
 */
export const ScriptPreference: (props: ScriptPreferenceProps) => ReactNode = () => null
