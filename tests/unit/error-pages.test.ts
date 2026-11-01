import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import ErrorPage from '@/app/error'
import GlobalError from '@/app/global-error'

// next/font/local only works inside Next's compiler, so the test stands in the class it returns.
vi.mock('next/font/local', () => ({
  default: () => ({ variable: 'playfair-text-variable', style: { fontFamily: "'Playfair Text'" } }),
}))

const props = { error: new Error('boom'), retry: () => {}, reset: () => {} }

/** The first button in a rendered tree, found without a DOM. */
function buttonIn(node: ReactNode): ReactElement<{ onClick: () => void }> | undefined {
  if (Array.isArray(node)) return node.map(buttonIn).find(Boolean)
  if (!isValidElement<{ children?: ReactNode }>(node)) return undefined
  if (node.type === 'button') return node as ReactElement<{ onClick: () => void }>
  if (typeof node.type === 'function') {
    return buttonIn((node.type as (p: unknown) => ReactNode)(node.props))
  }
  return buttonIn(node.props.children)
}

describe('the error page', () => {
  const html = renderToStaticMarkup(createElement(ErrorPage, props))

  it('is the main landmark the skip link points at, with one h1', () => {
    expect(html).toMatch(/<main id="main"/)
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
  })

  it('offers a button to try again', () => {
    expect(html).toMatch(/<button type="button"[^>]*>Try again<\/button>/)
  })

  it('asks Next to render the page again when the button is pressed', () => {
    const retry = vi.fn()
    buttonIn(ErrorPage({ ...props, retry }))?.props.onClick()
    expect(retry).toHaveBeenCalledOnce()
  })
})

describe('the global error page', () => {
  const html = renderToStaticMarkup(createElement(GlobalError, props))

  it('is a whole document in English, with a title and one h1', () => {
    expect(html).toContain('<html lang="en"')
    expect(html).toMatch(/<title>[^<]+<\/title>/)
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
  })

  it('sets its text in Playfair, as the root layout does', () => {
    expect(html).toMatch(/<html lang="en" class="playfair-text-variable"/)
  })

  it('offers a submit button that reloads even when scripts never start', () => {
    expect(html).toMatch(/<form><button type="submit"[^>]*>Reload the page<\/button><\/form>/)
  })

  it('keeps the page out of search before launch, as the root layout does', () => {
    expect(html).toContain('<meta name="robots" content="noindex, nofollow"/>')
  })

  it('lets a keyboard skip to the main text', () => {
    expect(html).toContain('<a href="#main" class="skip-link">')
  })

  it('asks Next to render the site again when the button is pressed', () => {
    const retry = vi.fn()
    buttonIn(GlobalError({ ...props, retry }))?.props.onClick()
    expect(retry).toHaveBeenCalledOnce()
  })
})
