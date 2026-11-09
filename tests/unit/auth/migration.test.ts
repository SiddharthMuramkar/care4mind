import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
import { getMigrations } from 'better-auth/db/migration'
import { PGliteDialect } from 'kysely'
import { describe, expect, it } from 'vitest'

import { createAuth } from '@/lib/auth/create-auth'

import { TEST_SETTINGS } from './harness'

const options = (pglite: PGlite) =>
  createAuth({
    settings: TEST_SETTINGS,
    database: { dialect: new PGliteDialect({ pglite }), type: 'postgres' },
    sendEmail: async () => undefined,
  }).options

describe('the database migration', () => {
  it('creates every table Better Auth needs, so an upgrade that changes them fails here', async () => {
    const pglite = new PGlite()
    await pglite.exec(readFileSync('migrations/0001_auth.sql', 'utf8'))
    const { toBeCreated, toBeAdded } = await getMigrations(options(pglite))
    expect(toBeCreated.map(({ table }) => table)).toEqual([])
    expect(toBeAdded.map(({ table }) => table)).toEqual([])
    await pglite.close()
  })
})
