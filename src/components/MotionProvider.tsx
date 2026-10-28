'use client'

import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

// The animation features load after what they animate, in a script of their own, so neither
// is a long task.
const loadFeatures = () => import('./motion-features').then((module) => module.default)

/**
 * Motion is the last layer of the site's motion stack, after CSS and
 * <ViewTransition>. Wrap only the part that animates with it, inside a module
 * that loads once the page has started up (SwitchKnob), so Motion never holds
 * up a page. Its default ignores the reduce-motion setting, so it is switched
 * to "user" here.
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
