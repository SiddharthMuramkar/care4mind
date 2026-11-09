/** Sending email through Brevo's transactional API, the only email this site sends. */
import 'server-only'

import type { LoginSettings } from './settings'

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'

export interface OutgoingEmail {
  to: string
  subject: string
  text: string
  html: string
}

/** Send one email, or reject if the sender refuses it. */
export type SendEmail = (email: OutgoingEmail) => Promise<void>

/** The emailed code's message: the code in plain text and in HTML, nothing else variable. */
export function emailedCodeMessage(to: string, code: string): OutgoingEmail {
  const lines = [
    `Your Care4Mind code is ${code}.`,
    'It works for 10 minutes. If you didn’t ask for it, you can ignore this email.',
  ]
  return {
    to,
    subject: 'Your Care4Mind code',
    text: lines.join('\n\n'),
    html: lines.map((line) => `<p>${line}</p>`).join(''),
  }
}

/** A sender that posts each email to Brevo, or to the local stand-in a browser test run gives it. */
export function brevoSender(email: LoginSettings['email']): SendEmail {
  return async ({ to, subject, text, html }) => {
    const response = await fetch(email.apiUrl ?? BREVO_URL, {
      method: 'POST',
      headers: { 'api-key': email.apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { email: email.from, name: 'Care4Mind' },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html,
      }),
    })
    if (!response.ok) throw new Error(`Brevo refused an email: ${response.status}.`)
  }
}
