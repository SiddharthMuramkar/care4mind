/** The connection pool login talks to Postgres through, one per function instance. */
import 'server-only'

import { Pool } from 'pg'

/** Neon's suggested wait: room for a suspended database to wake, and no longer. */
const CONNECT_TIMEOUT_MS = 10_000

export function databasePool(connectionString: string): Pool {
  const pool = new Pool({ connectionString, connectionTimeoutMillis: CONNECT_TIMEOUT_MS })
  // A connection the database drops while idle emits this; pg has already removed it from the
  // pool, and without a listener Node treats it as an uncaught error. Only the message: the
  // error carries the whole client, connection details included.
  pool.on('error', (error) => {
    console.error(`Idle database connection failed: ${error.message}`)
  })
  return pool
}
