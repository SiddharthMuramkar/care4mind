/** The site's Better Auth instance, built on the first request so a build needs no settings. */
import 'server-only'

import { attachDatabasePool, waitUntil } from '@vercel/functions'
import { Pool } from 'pg'

import { createAuth, type Auth } from './create-auth'
import { brevoSender } from './email'
import { readLoginSettings } from './settings'

let auth: Auth | undefined

export function getAuth(): Auth {
  if (auth) return auth
  const settings = readLoginSettings(process.env)
  const pool = new Pool({ connectionString: settings.databaseUrl })
  attachDatabasePool(pool)
  auth = createAuth({
    settings,
    database: pool,
    sendEmail: brevoSender(settings.email),
    backgroundTask: waitUntil,
  })
  return auth
}
