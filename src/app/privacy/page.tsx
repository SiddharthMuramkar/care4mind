import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DeleteAccount } from '@/components/login'
import { ReadingPage } from '@/components/ReadingPage'
import { features } from '@/config/features'
import { hrefFor } from '@/content'
import { metadataFor } from '@/lib/metadata'

import reading from '@/styles/reading.module.css'

const PATH = hrefFor({ page: 'privacy' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * The Privacy page: a draft for the Client's adviser, which says only what the site does today.
 * It exists only while the login switch is on, because `metadataFor` answers 404 for a path that
 * isn't in this build's route registry. The contact line is a placeholder until the Client names
 * an address.
 */
export default function PrivacyPage() {
  // Not only the metadata: generateMetadata answering 404 doesn't stop this body rendering.
  if (!features.login) notFound()

  return (
    <ReadingPage path={PATH} titleId="privacy-title" title="Privacy">
      <p>
        This page says what Care4Mind keeps when you make an account, who helps run the site and how
        to delete your account.
      </p>

      <section className={reading.section} aria-labelledby="privacy-keep-title">
        <h2 id="privacy-keep-title" className={reading.sectionTitle}>
          What we keep
        </h2>
        <ul>
          <li>Your name and email address, which you give when you sign up.</li>
          <li>
            A user-session, the record that you are logged in, with your connection address and
            browser details from when you logged in. It lasts 7 days, renewed whenever you use the
            site, and ends when you log out.
          </li>
          <li>Your emailed code, in a scrambled form, for the 10 minutes it works.</li>
          <li>
            A count of recent requests from your connection address, to stop automated sign-ups.
          </li>
        </ul>
        <p>
          We ask for no password and no phone number, so we keep neither. We don’t save your answers
          to a Questionnaire or your result: they stay in your browser and are gone when you leave
          the page.
        </p>
        <p>
          Once you log in, your browser holds two cookies: one keeps you logged in and the other
          tells our pages whether to show Log in or Log out.
        </p>
      </section>

      <section className={reading.section} aria-labelledby="privacy-who-title">
        <h2 id="privacy-who-title" className={reading.sectionTitle}>
          Who helps run the site
        </h2>
        <ul>
          <li>
            Vercel hosts the site, and sees your connection address and browser details when you
            open a page.
          </li>
          <li>Neon runs the database that holds your account.</li>
          <li>
            Cloudflare runs the bot check on Sign up and Log in, which reads details of your browser
            and connection to tell people from bots.
          </li>
          <li>Brevo sends our emails, so your email address and the message pass through it.</li>
        </ul>
      </section>

      <section className={reading.section} aria-labelledby="privacy-delete-title">
        <h2 id="privacy-delete-title" className={reading.sectionTitle}>
          Deleting your account
        </h2>
        <p>
          You can delete your account at any time. We email you a link to confirm it, so nobody else
          using your phone or computer can do it for you. Deleting removes your name, your email
          address and every user-session from our database, and it can’t be undone. If you aren’t
          logged in, log in first and come back to this page.
        </p>
        <DeleteAccount logIn={hrefFor({ page: 'log-in' })} />
      </section>

      <section className={reading.section} aria-labelledby="privacy-contact-title">
        <h2 id="privacy-contact-title" className={reading.sectionTitle}>
          Questions
        </h2>
        <p>
          To ask about your data, write to <strong>[CONTACT ADDRESS TO BE ADDED]</strong>.
        </p>
      </section>
    </ReadingPage>
  )
}
