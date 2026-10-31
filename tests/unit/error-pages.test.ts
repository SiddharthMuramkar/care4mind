import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import ErrorPage from '@/app/error'
import GlobalError from '@/app/global-error'

const props = { error: new Error('boom'), retry: () => {}, reset: () => {} }

describe('the error page', () => {
  const html = renderToStaticMarkup(createElement(ErrorPage, props))

  it('is the main landmark the skip link points at, with one h1', () => {
    expect(html).toMatch(/<main id="main"/)
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
  })

  it('offers a button to try again', () => {
    expect(html).toMatch(/<button type="button"[^>]*>Try again<\/button>/)
  })
})

describe('the global error page', () => {
  const html = renderToStaticMarkup(createElement(GlobalError, props))

  it('is a whole document in English, with a title and one h1', () => {
    expect(html).toContain('<html lang="en"')
    expect(html).toMatch(/<title>[^<]+<\/title>/)
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
  })

  it('offers a button to reload', () => {
    expect(html).toMatch(/<button type="button"[^>]*>Reload the page<\/button>/)
  })
})
