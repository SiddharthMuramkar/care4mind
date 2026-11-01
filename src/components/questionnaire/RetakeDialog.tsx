'use client'

import { AlertDialog } from '@base-ui/react/alert-dialog'
import { useRef } from 'react'

import { cta } from '@/components/cta'

import styles from './RetakeDialog.module.css'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Clear every answer and go back to part 1. */
  onConfirm: () => void
  /** Where focus goes once the answers are cleared: the first part's heading. */
  afterConfirm: () => HTMLElement | null
}

/**
 * Retake asks first. Keeping the answers is the first choice and takes focus; it returns focus
 * to Retake. Clearing them returns to part 1 with focus on its heading. Loaded only once the end
 * screen is shown, so the flow's own code stays small.
 */
export function RetakeDialog({ open, onOpenChange, onConfirm, afterConfirm }: Props) {
  const confirmed = useRef(false)
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (next) confirmed.current = false
        onOpenChange(next)
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={styles.backdrop} />
        <AlertDialog.Popup
          className={styles.popup}
          data-paper
          finalFocus={() => (confirmed.current ? afterConfirm() : true)}
        >
          <AlertDialog.Title className={styles.title}>Start again?</AlertDialog.Title>
          <AlertDialog.Description className={styles.description}>
            This clears every answer you have given and takes you back to part 1. Nothing was saved
            anywhere, so they can’t be brought back.
          </AlertDialog.Description>
          <div className={styles.actions}>
            <AlertDialog.Close className={cta.secondary}>Keep my answers</AlertDialog.Close>
            <button
              type="button"
              className={cta.primary}
              data-ink
              onClick={() => {
                confirmed.current = true
                onConfirm()
                onOpenChange(false)
              }}
            >
              Clear and start again
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
