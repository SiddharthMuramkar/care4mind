'use client'

import { type Ref, useEffect, useImperativeHandle, useRef } from 'react'

import { BOT_CHECK_ACTION } from '@/lib/auth/shared'

interface TurnstileApi {
  render: (element: HTMLElement, options: Record<string, unknown>) => string | undefined
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export interface TurnstileHandle {
  /** Ask for a new token: each one works once, so every send uses a new widget state. */
  reset: () => void
}

interface Props {
  siteKey: string
  /** Called with each new token, and with null when the token is gone. */
  onToken: (token: string | null) => void
  ref?: Ref<TurnstileHandle>
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/** Below this width Cloudflare's widget can't fit its normal layout, so it takes its compact one. */
const FLEXIBLE_MIN_WIDTH = 300

let loaded: Promise<TurnstileApi> | undefined

/** Cloudflare's script, added once for the whole visit however many forms ask for it. */
function loadTurnstile(): Promise<TurnstileApi> {
  loaded ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT
    script.async = true
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('no turnstile'))
    script.onerror = () => {
      loaded = undefined
      reject(new Error('The bot check’s script did not load.'))
    }
    document.head.append(script)
  })
  return loaded
}

/**
 * Cloudflare Turnstile, Managed mode: it checks the visitor in the background and asks for a
 * click only when it sees risk. Rendered explicitly, so a reset can ask for a new token on every
 * send of an emailed code; the token it hands back is what the server verifies.
 */
export function TurnstileWidget({ siteKey, onToken, ref }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | undefined>(undefined)

  useEffect(() => {
    let unmounted = false
    void loadTurnstile()
      .then((turnstile) => {
        const element = box.current
        if (unmounted || !element) return
        widget.current = turnstile.render(element, {
          sitekey: siteKey,
          action: BOT_CHECK_ACTION,
          size: element.clientWidth < FLEXIBLE_MIN_WIDTH ? 'compact' : 'flexible',
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(null),
          'timeout-callback': () => onToken(null),
          'error-callback': () => {
            onToken(null)
            // Returning true tells Cloudflare the page has handled the error.
            return true
          },
        })
      })
      // A blocked script leaves the form's press saying the bot check hasn't finished.
      .catch(() => onToken(null))
    return () => {
      unmounted = true
      if (widget.current !== undefined) window.turnstile?.remove(widget.current)
      widget.current = undefined
    }
  }, [siteKey, onToken])

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        onToken(null)
        if (widget.current !== undefined) window.turnstile?.reset(widget.current)
      },
    }),
    [onToken],
  )

  return <div ref={box} />
}
