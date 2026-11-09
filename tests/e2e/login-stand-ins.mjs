// The local stand-ins a browser test run logs in against, none of which exist in production:
// Postgres (PGlite, which starts empty and is built from the committed migration), Brevo (a sink
// that keeps every email so a spec can read its code) and Cloudflare's token check (answering as
// Cloudflare answers for a test secret: success, hostname example.com, no action).
//
//   node tests/e2e/login-stand-ins.mjs <database-port> <stand-in-port>

import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'

import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'

const [databasePort, standInPort] = process.argv.slice(2).map(Number)

const db = new PGlite()
await db.exec(readFileSync(new URL('../../migrations/0001_auth.sql', import.meta.url), 'utf8'))
await new PGLiteSocketServer({
  db,
  port: databasePort,
  host: '127.0.0.1',
  maxConnections: 20,
}).start()

/** Every email sent, newest last. */
const inbox = []

const bodyOf = async (request) => {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${standInPort}`)
  const send = (status, value) => {
    response.writeHead(status, { 'content-type': 'application/json' })
    response.end(JSON.stringify(value))
  }
  if (request.method === 'POST' && url.pathname === '/v3/smtp/email') {
    const email = await bodyOf(request)
    inbox.push({
      to: email.to?.[0]?.email,
      subject: email.subject,
      text: email.textContent,
      html: email.htmlContent,
    })
    send(201, { messageId: `stand-in-${inbox.length}` })
  } else if (request.method === 'POST' && url.pathname === '/turnstile/v0/siteverify') {
    await bodyOf(request)
    send(200, { success: true, hostname: 'example.com', 'error-codes': [] })
  } else if (request.method === 'GET' && url.pathname === '/inbox') {
    send(
      200,
      inbox.filter(({ to }) => to === url.searchParams.get('to')),
    )
  } else {
    send(404, { error: 'not a stand-in route' })
  }
}).listen(standInPort, '127.0.0.1')
