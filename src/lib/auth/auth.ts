/** The site's Better Auth instance, built on the first request so a build needs no settings. */
import 'server-only'

import { attachDatabasePool, waitUntil } from '@vercel/functions'
import { checkBotId } from 'botid/server'

import { createAuth, type Auth } from './create-auth'
import { databasePool } from './database-pool'
import { logDefence } from './defences'
import { brevoSender } from './email'
import { readLoginSettings } from './settings'

let auth: Auth | undefined

export function getAuth(): Auth {
  if (auth) return auth
  const settings = readLoginSettings(process.env)
  const pool = databasePool(settings.databaseUrl)
  attachDatabasePool(pool)
  auth = createAuth({
    settings,
    database: pool,
    sendEmail: brevoSender(settings.email),
    // Off Vercel there is no BotID to ask, so a local production build answers as a human.
    checkBotId: () => checkBotId({ developmentOptions: { isDevelopment: !process.env.VERCEL } }),
    recordDefence: logDefence,
    backgroundTask: waitUntil,
  })
  return auth
}
