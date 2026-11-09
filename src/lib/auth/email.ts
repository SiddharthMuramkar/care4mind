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

/** How long a Delete my account link works, in hours: Better Auth is told the same. */
export const DELETE_LINK_HOURS = 24

/** The Delete my account email: a link to a page that asks for one more press, not a deletion. */
export function deleteAccountMessage(to: string, link: string): OutgoingEmail {
  const lines = [
    'To delete your Care4Mind account, open this link in the browser where you’re logged in, then press the button on that page.',
    `It works for ${DELETE_LINK_HOURS} hours. If you didn’t ask for it, you can ignore this email and your account stays as it is.`,
  ]
  return {
    to,
    subject: 'Delete your Care4Mind account',
    text: `${lines[0]}\n\n${link}\n\n${lines[1]}`,
    html: `<p>${lines[0]}</p><p><a href="${link}">Delete my account</a></p><p>${lines[1]}</p>`,
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
