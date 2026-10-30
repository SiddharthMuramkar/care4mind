'use client'

import { lazy, Suspense, useEffect, useState } from 'react'

import { onFirstToast } from './toast'

const ToastViewport = lazy(() =>
  import('./ToastViewport').then((module) => ({ default: module.ToastViewport })),
)

/**
 * The site's one toast provider, in the root layout. It costs nothing until the first toast():
 * then Base UI's Toast loads, its polite live region goes on the page, and the toast follows.
 */
export function Toaster() {
  const [wanted, setWanted] = useState(false)
  useEffect(() => onFirstToast(() => setWanted(true)), [])
  return wanted ? (
    <Suspense fallback={null}>
      <ToastViewport />
    </Suspense>
  ) : null
}
