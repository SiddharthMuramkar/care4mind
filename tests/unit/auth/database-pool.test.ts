import { afterEach, describe, expect, it, vi } from 'vitest'

import { databasePool } from '@/lib/auth/database-pool'

afterEach(() => vi.restoreAllMocks())

describe('the database pool', () => {
  it('gives up on a stalled connection in ten seconds, instead of leaving the form waiting', async () => {
    const pool = databasePool('postgres://user:pass@db.example.test/care4mind')
    expect(pool.options.connectionTimeoutMillis).toBe(10_000)
    await pool.end()
  })

  it('logs a dropped idle connection and carries on, instead of crashing the function', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const pool = databasePool('postgres://user:pass@db.example.test/care4mind')
    expect(() => pool.emit('error', new Error('terminating connection'), {})).not.toThrow()
    expect(log).toHaveBeenCalledWith('Idle database connection failed: terminating connection')
    await pool.end()
  })
})
