#!/usr/bin/env node
// @ts-check
// Serves the production build to Lighthouse over HTTP/2 with TLS, as Vercel serves visitors.
//
//   node scripts/lhci/h2-server.mjs <port>
//
// `next start` speaks only plain HTTP/1.1, so this starts it on the next port up, reachable only
// from this machine, and answers on <port> with HTTP/2 over TLS, passing every request through
// unchanged (bytes, compression and headers are next start's own). The certificate is
// self-signed, made with openssl at start-up and deleted at once; Lighthouse's Chrome accepts it
// through --ignore-certificate-errors (lighthouserc.cjs). Prints "Ready in …", the line
// lighthouserc.cjs waits for, once both servers listen.
//
// Plain Node and openssl, no dependencies.

import { execFileSync, spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import http from 'node:http'
import http2 from 'node:http2'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const USAGE = 'usage: node scripts/lhci/h2-server.mjs <port>'
// Headers about one HTTP/1.1 connection, which HTTP/2 forbids.
const CONNECTION_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-connection',
  'transfer-encoding',
  'upgrade',
  'http2-settings',
])

const startedAt = performance.now()
const port = Number(process.argv[2])
if (!/^\d+$/.test(process.argv[2] ?? '') || port < 1 || port > 65_534) {
  console.error(
    `${USAGE}\nThe port must be a number from 1 to 65534: next start takes the one after it.`,
  )
  process.exit(2)
}
const innerPort = port + 1

/** A throwaway self-signed certificate for localhost, valid for a day. */
function selfSignedCertificate() {
  const dir = mkdtempSync(join(tmpdir(), 'care4mind-lhci-'))
  try {
    // prettier-ignore
    execFileSync('openssl', [
      'req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:prime256v1', '-nodes',
      '-days', '1', '-subj', '/CN=localhost',
      '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1',
      '-keyout', join(dir, 'key.pem'), '-out', join(dir, 'cert.pem'),
    ], { stdio: 'pipe' })
    return { key: readFileSync(join(dir, 'key.pem')), cert: readFileSync(join(dir, 'cert.pem')) }
  } catch (error) {
    const reason =
      error.code === 'ENOENT' ? 'openssl is not installed' : String(error.stderr ?? error)
    throw new Error(`Couldn't make a certificate with openssl: ${reason}`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** Starts next start (what `pnpm start` runs) on the inner port; `ready` resolves once it is. */
function startNext() {
  const bin = createRequire(import.meta.url).resolve('next/dist/bin/next')
  const args = [bin, 'start', '-p', String(innerPort), '-H', '127.0.0.1']
  const next = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  /** @type {Promise<void>} */
  const ready = new Promise((resolve, reject) => {
    const listen = (chunk) => {
      output += chunk
      // Its own "Ready in" stays unprinted: lighthouserc.cjs must not take it for this server's.
      if (/\bReady in\b/i.test(output)) resolve()
    }
    next.stdout.on('data', listen)
    next.stderr.on('data', listen)
    next.once('exit', (code, signal) =>
      reject(
        new Error(
          `next start stopped (${signal ?? `exit ${code}`}) before it was ready:\n${output}`,
        ),
      ),
    )
  })
  return { next, ready }
}

function proxy(server) {
  const agent = new http.Agent({ keepAlive: true })
  server.on('stream', (stream, headers) => {
    const forwarded = { host: headers[':authority'], 'x-forwarded-proto': 'https' }
    for (const [name, value] of Object.entries(headers)) {
      if (!name.startsWith(':')) forwarded[name] = value
    }
    const request = http.request({
      host: '127.0.0.1',
      port: innerPort,
      method: headers[':method'],
      path: headers[':path'],
      headers: forwarded,
      agent,
    })
    let done = false
    // Halfway through a response, only a reset tells the browser the file is incomplete.
    const reset = () => stream.destroyed || stream.close(http2.constants.NGHTTP2_INTERNAL_ERROR)
    request.on('response', (response) => {
      const answer = { ':status': response.statusCode }
      for (const [name, value] of Object.entries(response.headers)) {
        if (!CONNECTION_HEADERS.has(name)) answer[name] = value
      }
      if (stream.destroyed) return response.resume()
      stream.respond(answer)
      response.on('end', () => (done = true))
      response.on('error', reset)
      response.pipe(stream)
    })
    request.on('error', (error) => {
      if (stream.destroyed) return
      if (stream.headersSent) return reset()
      stream.respond({ ':status': 502, 'content-type': 'text/plain; charset=utf-8' })
      stream.end(`next start didn't answer: ${error.message}\n`)
    })
    // A stream the browser cancels stops the request to next start too.
    stream.on('close', () => done || request.destroy())
    stream.on('error', () => request.destroy())
    stream.pipe(request)
  })
  // A browser that resets a stream or a session mustn't stop the server.
  server.on('sessionError', () => {})
}

/** @type {{ key: Buffer, cert: Buffer }} */
let certificate
try {
  certificate = selfSignedCertificate()
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

const { next, ready } = startNext()
const stop = () => {
  next.kill('SIGTERM')
  process.exit(0)
}
process.on('SIGTERM', stop)
process.on('SIGINT', stop)

try {
  await ready
  // HTTP/2 only: a client that can't speak it is refused, so a run never falls back to HTTP/1.1
  // unnoticed.
  const server = http2.createSecureServer(certificate)
  proxy(server)
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, () => resolve(undefined))
  })
  next.once('exit', (code, signal) => {
    console.error(`next start stopped (${signal ?? `exit ${code}`}), so this server stops too.`)
    process.exit(1)
  })
  const ms = Math.round(performance.now() - startedAt)
  console.log(
    `✓ Ready in ${ms}ms: https://localhost:${port} (HTTP/2, TLS) → next start on http://127.0.0.1:${innerPort}`,
  )
} catch (error) {
  console.error(error.message)
  next.kill('SIGTERM')
  process.exit(1)
}
