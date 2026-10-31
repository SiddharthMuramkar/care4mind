import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import PageError from '@/app/error'
import GlobalError from '@/app/global-error'

function elements(node: ReactNode): ReactElement[] {
  if (Array.isArray(node)) return node.flatMap(elements)
  if (!isValidElement(node)) return []
  const { children } = node.props as { children?: ReactNode }
  return [node, ...elements(children)]
}

describe('an error page', () => {
  it('renders one heading and a button that tries the page again', () => {
    const retry = vi.fn()
    // createElement(PageError) has not rendered, so the button is not in that element yet.
    const page = PageError({ error: new Error('stopped'), retry })
    const html = renderToStaticMarkup(page)

    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(html.match(/<button[\s>]/g)).toHaveLength(1)
    expect(html).toContain('id="main"')

    const button = elements(page).find((element) => element.type === 'button')
    const onClick = (button?.props as { onClick?: unknown } | undefined)?.onClick
    if (typeof onClick !== 'function') throw new Error('expected a retry button')
    onClick()
    expect(retry).toHaveBeenCalledOnce()
  })

  it('renders the root error as an English document', () => {
    const html = renderToStaticMarkup(createElement(GlobalError))
    expect(html).toContain('<html lang="en">')
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(html).toContain('>Reload<')
  })
})
