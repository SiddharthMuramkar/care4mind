'use client'

import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

// Motion's animation features load after the page is interactive, so they never delay first paint.
const loadFeatures = () => import('./motion-features').then((module) => module.default)

/**
 * Motion is the last layer of the site's motion stack, after CSS and
 * <ViewTransition>. Its default ignores the reduce-motion setting, so it is
 * switched to "user" here, once, for the whole site.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}
