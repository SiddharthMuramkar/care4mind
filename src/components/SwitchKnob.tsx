'use client'

import * as m from 'motion/react-m'

import { MotionProvider } from './MotionProvider'
import styles from './ScriptChoice.module.css'

// Settles in --duration-move (0.32 s), as the spellings do. Under reduced motion Motion jumps it instead.
const SPRING = { type: 'spring', visualDuration: 0.32, bounce: 0.4 } as const

/** The "Devanagari first" switch's knob, sprung by Motion from one loop of its track to the other. */
export function SwitchKnob({ on }: { on: boolean }) {
  return (
    <MotionProvider>
      <m.span
        className={styles.knob}
        initial={false}
        animate={{ x: on ? '100%' : '0%' }}
        transition={SPRING}
      />
    </MotionProvider>
  )
}
