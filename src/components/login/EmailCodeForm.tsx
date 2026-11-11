'use client'

import type { Route } from 'next'
import Link from 'next/link'
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import cta from '@/components/Cta'
import { safeReturnAddress } from '@/lib/auth/return-address'
import { authAddress, LOGIN_INTENT_HEADER } from '@/lib/auth/shared'

import { useHydrated } from '../browser'
import styles from './EmailCodeForm.module.css'
import { GoogleMark } from './GoogleMark'
import { type TurnstileHandle, TurnstileWidget } from './TurnstileWidget'

const never = () => () => {}

/** How many digits an emailed code has: a paste with anything else is reduced to these. */
const CODE_LENGTH = 6

const HEADING = 'email-code-heading'

const TICK_BOX = 'I am 18 or over and agree that Care4Mind can see my results'

const NEW_ACCOUNTS_CAPPED =
  'We’re taking a lot of new accounts just now. Please try again in an hour.'
const THROWAWAY = 'That looks like a throwaway email address. Please use one you keep.'
/** Sign up answers this whether or not the address has an account, so it covers both. */
const THROWAWAY_CODE_REFUSED = `${THROWAWAY} Already have an account with it? Log in instead.`

/** What each error Google sign-in comes back with means for the user; anything else is generic. */
const GOOGLE_ERRORS: Readonly<Record<string, string>> = {
  signup_disabled:
    'There’s no account for that Google address yet. Tick the box below, then continue with Google to sign up.',
  access_denied: 'Google sign-in didn’t finish. Please try again, or use an emailed code instead.',
  EMAIL_NOT_CONFIRMED:
    'Google hasn’t confirmed that email address, so we can’t use it. Please use an emailed code instead.',
  TICK_BOX_NEEDED: 'Please tick the box below, then continue with Google.',
  account_not_linked:
    'We couldn’t connect that Google account. Please use an emailed code instead.',
  NEW_ACCOUNT_CAP: NEW_ACCOUNTS_CAPPED,
  THROWAWAY_EMAIL: THROWAWAY,
}

const GOOGLE_ERROR = 'Google sign-in didn’t work. Please try again, or use an emailed code instead.'

/** The message for the error Google sign-in left in the address, if it left one. */
function googleErrorFrom(query: string): string {
  const code = new URLSearchParams(query).get('error')
  return code ? (GOOGLE_ERRORS[code] ?? GOOGLE_ERROR) : ''
}

/** The address's query with Google's error gone, so it isn't carried on to the other screen. */
function withoutGoogleError(query: string): string {
  const params = new URLSearchParams(query)
  params.delete('error')
  params.delete('error_description')
  const rest = params.toString()
  return rest ? `?${rest}` : ''
}

/** How many failed bot checks count as a person who keeps failing it. */
const KEEPS_FAILING = 2

const COPY = {
  'sign-up': {
    submit: 'Email me a code',
    other: { lead: 'Already have an account?', action: 'Log in' },
    sent: (email: string) => `We’ve sent a six-digit code to ${email}. It works for 10 minutes.`,
  },
  'log-in': {
    submit: 'Email me a code',
    other: { lead: 'No account yet?', action: 'Sign up' },
    // The same words for an address with an account and one without, so nobody can learn which.
    sent: (email: string) =>
      `If ${email} has an account, a six-digit code is on its way. It works for 10 minutes.`,
  },
} as const

async function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return fetch(authAddress(path), {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

/** What to say when asking for a code fails, and whether the bot check is what failed. */
async function sendError(response: Response): Promise<{ message: string; botCheck: boolean }> {
  const { code } = ((await response.json().catch(() => ({}))) ?? {}) as { code?: string }
  if (code === 'THROWAWAY_EMAIL') return { message: THROWAWAY_CODE_REFUSED, botCheck: false }
  if (code === 'EMAIL_LIMIT') {
    return {
      message: 'This email has had several codes already. Please wait an hour and try again.',
      botCheck: false,
    }
  }
  if (response.status === 429) {
    return {
      message: 'Too many tries from here just now. Please wait a minute and try again.',
      botCheck: false,
    }
  }
  if (code === 'INVALID_EMAIL') {
    return { message: 'Please check your email address and try again.', botCheck: false }
  }
  if (code === 'MISSING_RESPONSE' || code === 'VERIFICATION_FAILED') {
    return { message: 'The bot check didn’t work. Please try it once more.', botCheck: true }
  }
  return {
    message: 'Something went wrong on our side. Please try again in a minute.',
    botCheck: false,
  }
}

/** A whole code in what was typed or pasted, ahead of any stray digit, such as Care4Mind's. */
const WHOLE_CODE = new RegExp(`\\d{${CODE_LENGTH}}`)

/** The digits of a code from a paste, which may hold spaces or the whole line of the email. */
const codeFrom = (typed: string) =>
  WHOLE_CODE.exec(typed)?.[0] ?? typed.replace(/\D/g, '').slice(0, CODE_LENGTH)

/** What a refused code means, and whether the user has to go back to the details to fix it. */
async function codeError(response: Response): Promise<{ message: string; toDetails: boolean }> {
  const { code } = ((await response.json().catch(() => ({}))) ?? {}) as { code?: string }
  const stay = (message: string) => ({ message, toDetails: false })
  if (code === 'NEW_ACCOUNT_CAP') return stay(NEW_ACCOUNTS_CAPPED)
  if (response.status === 429)
    return stay('Too many tries just now. Please wait a minute and try again.')
  if (code === 'OTP_EXPIRED') return stay('That code has run out. Ask for a new one below.')
  if (code === 'TOO_MANY_ATTEMPTS')
    return stay('That code has had too many wrong tries. Ask for a new one below.')
  // A spent or run-out code also lands here once its first refusal has passed: Better Auth has
  // deleted it by then, so the words have to fit a code that can never work as well.
  if (code === 'INVALID_OTP')
    return stay('That code isn’t right. Please check it and try again, or ask for a new one below.')
  // The name and the tick box are on the details step: the code step can't fix either.
  if (code === 'NAME_NEEDED')
    return {
      message: 'Please give your name (up to 100 characters) and ask for a new code.',
      toDetails: true,
    }
  if (code === 'TICK_BOX_NEEDED')
    return { message: 'Please tick the box first, and ask for a new code.', toDetails: true }
  return stay('Something went wrong on our side. Please try again in a minute.')
}

interface Props {
  mode: 'sign-up' | 'log-in'
  /** The bot check's site key, read on the server. */
  siteKey: string
  /** The other screen: Sign up links to Log in, and Log in to Sign up. */
  otherScreen: Route
}

/**
 * Sign up or Log in with an emailed code, in two steps: first the details and the bot check,
 * then the code. Getting a code back returns the user to the page they came from.
 */
export function EmailCodeForm({ mode, siteKey, otherScreen }: Props) {
  const [step, setStep] = useState<'details' | 'code'>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [code, setCode] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sentAgain, setSentAgain] = useState(false)
  const [botCheckFailures, setBotCheckFailures] = useState(0)
  // Before this, the browser would submit the form itself: the details would go in the address.
  const hydrated = useHydrated()

  const widget = useRef<TurnstileHandle>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const emailField = useRef<HTMLInputElement>(null)
  const changingEmail = useRef(false)
  const copy = COPY[mode]

  // A chunk of its own, loaded by the form: only the login pages carry BotID's script.
  useEffect(() => {
    void import('./startBotId')
  }, [])

  useEffect(() => {
    if (step === 'code') {
      heading.current?.focus()
    } else if (changingEmail.current) {
      changingEmail.current = false
      emailField.current?.focus()
    }
  }, [step])

  const onToken = useCallback((value: string | null) => setToken(value), [])
  const onBotCheckFailure = useCallback(
    (final: boolean) => setBotCheckFailures((count) => (final ? KEEPS_FAILING : count + 1)),
    [],
  )

  /** Ask for a code: the token it uses works once, so the widget is reset afterwards. */
  async function requestCode(): Promise<boolean> {
    if (!token) {
      setError('The bot check hasn’t finished yet. Please wait a moment.')
      return false
    }
    setBusy(true)
    setError('')
    try {
      const response = await post(
        '/email-otp/send-verification-otp',
        { email, type: 'sign-in' },
        { 'x-captcha-response': token, [LOGIN_INTENT_HEADER]: mode },
      )
      if (!response.ok) {
        const { message, botCheck } = await sendError(response)
        if (botCheck) setBotCheckFailures((count) => count + 1)
        setError(message)
        return false
      }
      setBotCheckFailures(0)
      return true
    } catch {
      setError('We couldn’t reach the site. Please check your connection and try again.')
      return false
    } finally {
      setBusy(false)
      widget.current?.reset()
    }
  }

  async function submitDetails(event: FormEvent) {
    event.preventDefault()
    if (mode === 'sign-up' && !name.trim()) {
      setError('Please give your name.')
      return
    }
    if (await requestCode()) {
      setSentAgain(false)
      setStep('code')
    }
  }

  /** Back to the details to fix a mistyped address; what the user already typed there stays. */
  function changeEmail() {
    changingEmail.current = true
    setCode('')
    setError('')
    setSentAgain(false)
    setToken(null)
    setStep('details')
  }

  async function resend() {
    setCode('')
    // Cleared first, so each new code is a change a screen reader announces.
    setSentAgain(false)
    if (await requestCode()) setSentAgain(true)
  }

  async function submitCode(event: FormEvent) {
    event.preventDefault()
    if (code.length !== CODE_LENGTH) {
      setError(`An emailed code has ${CODE_LENGTH} digits. Please check it and try again.`)
      return
    }
    setBusy(true)
    setError('')
    try {
      const response = await post('/sign-in/email-otp', {
        email,
        otp: code,
        ...(mode === 'sign-up' ? { name, agreed } : {}),
      })
      if (!response.ok) {
        const { message, toDetails } = await codeError(response)
        setError(message)
        if (toDetails) {
          setCode('')
          setToken(null)
          setStep('details')
        }
        return
      }
      const next = new URLSearchParams(window.location.search).get('next')
      window.location.replace(safeReturnAddress(next))
    } catch {
      setError('We couldn’t reach the site. Please check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  /** Off to Google: the same token rule as a code, and Sign up asks for the tick box first. */
  async function continueWithGoogle() {
    if (mode === 'sign-up' && !agreed) {
      setError('Please tick the box first, then continue with Google.')
      return
    }
    if (!token) {
      setError('The bot check hasn’t finished yet. Please wait a moment.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const params = new URLSearchParams(window.location.search)
      const response = await post(
        '/sign-in/social',
        {
          provider: 'google',
          callbackURL: safeReturnAddress(params.get('next')),
          errorCallbackURL: `${window.location.pathname}${withoutGoogleError(window.location.search)}`,
          disableRedirect: true,
          ...(mode === 'sign-up' ? { requestSignUp: true, additionalData: { agreed: true } } : {}),
        },
        { 'x-captcha-response': token },
      )
      if (!response.ok) {
        const { message, botCheck } = await sendError(response)
        if (botCheck) setBotCheckFailures((count) => count + 1)
        setError(message)
        return
      }
      setBotCheckFailures(0)
      const { url } = (await response.json()) as { url: string }
      window.location.assign(url)
    } catch {
      setError('We couldn’t reach the site. Please check your connection and try again.')
    } finally {
      setBusy(false)
      widget.current?.reset()
    }
  }

  // Always in the page, empty until needed, so a screen reader announces the things to try.
  const botCheckHelp = (
    <div className={styles.help} role="status">
      {botCheckFailures >= KEEPS_FAILING ? (
        <>
          <p>The bot check keeps failing. Things to try:</p>
          <ul>
            <li>Open this page in another browser.</li>
            <li>Use mobile data instead of Wi-Fi.</li>
            <li>Turn off your VPN, if you use one.</li>
          </ul>
        </>
      ) : null}
    </div>
  )

  // The next page, passed on when the user moves between Sign up and Log in.
  const query = useSyncExternalStore(
    never,
    () => window.location.search,
    () => '',
  )

  // A plain string: the old-address redirects make Route too long a union for a dependency array.
  const otherPath: string = otherScreen

  // A new Google user who pressed Log in has no account: send them to Sign up for the tick box,
  // with the page to come back to and the reason to show there.
  useEffect(() => {
    const search = window.location.search
    if (mode === 'log-in' && new URLSearchParams(search).get('error') === 'signup_disabled') {
      window.location.replace(`${otherPath}${search}`)
    }
  }, [mode, otherPath])

  const otherQuery = withoutGoogleError(query)

  return (
    <div className={styles.form}>
      {step === 'details' ? (
        <form onSubmit={(event) => void submitDetails(event)}>
          {mode === 'sign-up' ? (
            <div className={styles.field}>
              <label htmlFor="login-name" className={styles.label}>
                Your name
              </label>
              <input
                id="login-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={styles.input}
              />
            </div>
          ) : null}
          <div className={styles.field}>
            <label htmlFor="login-email" className={styles.label}>
              Your email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              ref={emailField}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
            />
          </div>
          {mode === 'sign-up' ? (
            <label className={styles.tick}>
              <input
                type="checkbox"
                name="agreed"
                required
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className={styles.tickBox}
              />
              <span>{TICK_BOX}</span>
            </label>
          ) : null}
          <TurnstileWidget
            ref={widget}
            siteKey={siteKey}
            onToken={onToken}
            onFailure={onBotCheckFailure}
          />
          {botCheckHelp}
          <div>
            <p className={styles.error} role="alert">
              {error || googleErrorFrom(query)}
            </p>
            <button type="submit" className={cta.primary} disabled={busy || !hydrated}>
              {copy.submit}
            </button>
          </div>
          <div className={styles.google}>
            <p className={styles.other}>Or, without an emailed code:</p>
            <button
              type="button"
              className={`${cta.secondary} ${styles.googleButton}`}
              onClick={() => void continueWithGoogle()}
              disabled={busy || !hydrated}
            >
              <span className={styles.googleMark}>
                <GoogleMark />
              </span>
              Continue with Google
            </button>
          </div>
          <p className={styles.other}>
            {copy.other.lead}{' '}
            <Link href={`${otherScreen}${otherQuery}` as Route}>{copy.other.action}</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={(event) => void submitCode(event)}>
          <h2 id={HEADING} ref={heading} tabIndex={-1} className={styles.heading}>
            Enter your emailed code
          </h2>
          <p className={styles.sent}>{copy.sent(email)}</p>
          <button
            type="button"
            className={`${cta.secondary} ${styles.changeEmail}`}
            onClick={changeEmail}
            disabled={busy}
          >
            Use a different email
          </button>
          {mode === 'log-in' ? (
            <p className={styles.other}>
              {copy.other.lead}{' '}
              <Link href={`${otherScreen}${otherQuery}` as Route}>{copy.other.action}</Link>
            </p>
          ) : null}
          <div className={styles.field}>
            <label htmlFor="login-code" className={styles.label}>
              Your six-digit code
            </label>
            <input
              id="login-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              // No maxLength: it would cut a paste that holds spaces before they are removed.
              onChange={(event) => setCode(codeFrom(event.target.value))}
              // A whole code pasted replaces the field, whatever digits or caret it finds there.
              onPaste={(event) => {
                const pasted = codeFrom(event.clipboardData.getData('text'))
                if (pasted.length === CODE_LENGTH) {
                  event.preventDefault()
                  setCode(pasted)
                }
              }}
              className={styles.input}
            />
          </div>
          <div>
            <p className={styles.error} role="alert">
              {error}
            </p>
            <button type="submit" className={cta.primary} disabled={busy}>
              Confirm
            </button>
          </div>
          <div className={styles.resend}>
            <TurnstileWidget
              ref={widget}
              siteKey={siteKey}
              onToken={onToken}
              onFailure={onBotCheckFailure}
            />
            {botCheckHelp}
            <button
              type="button"
              className={cta.secondary}
              onClick={() => void resend()}
              disabled={busy || !token}
            >
              Send a new code
            </button>
            {/* Always in the page, empty until needed, so a screen reader announces each new code. */}
            <p className={styles.sent} role="status">
              {sentAgain ? 'A new code is on its way.' : ''}
            </p>
          </div>
        </form>
      )}
    </div>
  )
}
