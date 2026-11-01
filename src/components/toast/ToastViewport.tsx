'use client'

import { Toast } from '@base-ui/react/toast'
import { useEffect } from 'react'

import { CloseGlyph, SealGlyph } from '@/components/nav/glyphs'

import { connectToasts, type ToastMessage } from './toast'
import styles from './ToastViewport.module.css'

const manager = Toast.createToastManager<Pick<ToastMessage, 'lang'>>()

/**
 * Base UI's Toast, loaded with the first toast(): one polite live region in the corner, each
 * toast a dark slip sealed in vermilion, its tick inking in as it arrives. A toast stays 6 s,
 * longer while the pointer or focus is on it, and goes with Dismiss, a swipe or F6 then Escape.
 */
export function ToastViewport() {
  useEffect(() => {
    // Two frames on, the empty region is in the accessibility tree, so the first toast is announced.
    let disconnect = () => {}
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        disconnect = connectToasts(({ title, description, lang }) => {
          manager.add({ title, description, data: { lang }, priority: 'low' })
        })
      })
    })
    return () => {
      cancelAnimationFrame(frame)
      disconnect()
    }
  }, [])

  return (
    <Toast.Provider toastManager={manager} timeout={6000} limit={3}>
      <Toast.Portal>
        <Toast.Viewport className={styles.viewport}>
          <Toasts />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}

function Toasts() {
  const { toasts } = Toast.useToastManager<Pick<ToastMessage, 'lang'>>()
  return toasts.map((toast) => (
    <Toast.Root key={toast.id} toast={toast} className={styles.toast}>
      <Toast.Content className={styles.content}>
        <SealGlyph className={styles.seal} tickClassName={styles.tick} />
        <div className={styles.text}>
          {/* Paragraphs, not headings: a toast is a passing note, not part of the page's outline. */}
          <Toast.Title className={styles.title} render={<p />} />
          {toast.description ? (
            <Toast.Description
              className={styles.description}
              render={<p lang={toast.data?.lang} />}
            />
          ) : null}
        </div>
        <Toast.Close className={styles.close} aria-label="Dismiss">
          <CloseGlyph className={styles.closeGlyph} />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ))
}
