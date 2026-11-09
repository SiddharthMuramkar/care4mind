import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import RootLayout, { generateMetadata } from '@/app/layout'
import { ReferenceEntry } from '@/components/library'
import { Text } from '@/components/prose'
import { siteConfig } from '@/config/site'
import { references } from '@/content'
import { customProperties, resolveColour } from '@/styles/contrast'

import nextConfig from '../../next.config'

// next/font/local only works inside Next's compiler, so the test stands in the class it returns.
vi.mock('next/font/local', () => ({
  default: () => ({ variable: 'playfair-text-variable', style: { fontFamily: "'Playfair Text'" } }),
}))

// The keep list: small workings a restyle or a metadata rewrite could drop without noticing.
// Each check fails the moment its working is removed, so dropping one is always a decision.

type ElementProps = { children?: ReactNode; href?: string; className?: string; lang?: string }

/** The root layout's element tree, unrendered: its header and footer read content async. */
function layoutTree(): ReactElement<ElementProps> {
  return RootLayout({ children: createElement('p', null, 'page') }) as ReactElement<ElementProps>
}

/** The children of an element, as elements: text and empty places left out. */
function elementChildren(node: ReactElement<ElementProps>): ReactElement<ElementProps>[] {
  const children = node.props.children
  const list = Array.isArray(children) ? children : [children]
  return list.filter((child): child is ReactElement<ElementProps> => isValidElement(child))
}

describe('search engines stay out until launch', () => {
  it('keeps the indexable switch off, so turning it on is the launch decision', () => {
    expect(siteConfig.indexable).toBe(false)
  })

  it('says noindex to every robot and to Googlebot by name in the root metadata', async () => {
    expect((await generateMetadata()).robots).toEqual({
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    })
  })

  it('says noindex again in the X-Robots-Tag header on every path', async () => {
    expect((await nextConfig.headers?.()) ?? []).toContainEqual({
      source: '/:path*',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    })
  })
})

describe('the security headers', () => {
  it('go out on every path', async () => {
    expect((await nextConfig.headers?.()) ?? []).toContainEqual({
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
      ],
    })
  })
})

describe('the skip link', () => {
  it('is the first thing in the body, leading to the main landmark', () => {
    const body = elementChildren(layoutTree()).find((child) => child.type === 'body')
    const first = body ? elementChildren(body)[0] : undefined
    expect(first?.type).toBe('a')
    expect(first?.props.href).toBe('#main')
    expect(first?.props.className).toBe('skip-link')
    expect(String(first?.props.children ?? '').trim()).toBe('Skip to content')
  })
})

describe('the focus outline', () => {
  it('draws a 3 px solid outline in the gold focus colour', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/globals.css'), 'utf8')
    const rule = /(?:^|\n)\s*:focus-visible\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(rule).toMatch(/outline:\s*3px solid var\(--color-focus\)/)
    // The token blocks alone: a paper surface remaps the token further down the sheet.
    const declarations = customProperties(css.slice(0, css.indexOf('@layer base')))
    // Typed out, not read from the token, so repointing the token fails: turmeric-light gold.
    expect(resolveColour('var(--color-focus)', declarations)).toBe('#f6c453')
  })
})

describe('a Library link to another site', () => {
  it('says it leaves in words, for every Reference read elsewhere', async () => {
    const elsewhere = (await references.list()).filter(
      (reference) => reference.doi ?? reference.url,
    )
    expect(elsewhere.length).toBeGreaterThan(0)
    for (const reference of elsewhere) {
      const href = reference.doi ? `https://doi.org/${reference.doi}` : (reference.url ?? '')
      const html = renderToStaticMarkup(
        createElement(ReferenceEntry, { reference, topics: [], citing: new Map() }),
      )
      // React writes &, ' and " in an attribute as character references.
      const attribute = href.replace(/&/g, '&amp;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;')
      expect(html, reference.id).toContain(`href="${attribute}"`)
      expect(html, reference.id).toMatch(/, another site<span aria-hidden="true"> ↗<\/span>/)
    }
  })
})

describe('language tags', () => {
  it('tags each Devanagari run in running text as Sanskrit, leaving the rest untagged', () => {
    const html = renderToStaticMarkup(createElement(Text, { text: 'The word योग means union.' }))
    expect(html).toBe('The word <span lang="sa-Deva">योग</span> means union.')
  })

  it('sets the document language to English', () => {
    expect(layoutTree().props.lang).toBe('en')
  })
})
