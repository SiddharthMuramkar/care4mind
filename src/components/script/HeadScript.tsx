import type { ReactNode } from 'react'

/**
 * Slot, added by front-end-site ticket 04 and filled by ticket 13: the tiny inline script in the
 * document's head that applies the stored script choice (`html[data-script]`) before the first
 * paint. The root layout mounts it only while `features.devanagariFirst` is on, and its <html>
 * carries suppressHydrationWarning for the attribute the script sets. This stub renders nothing.
 */
export const HeadScript: () => ReactNode = () => null
