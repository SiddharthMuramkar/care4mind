import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import { redirects } from '@/config/redirects'
import { site as config } from '@/config/site'
import { site } from '@/content'
import { metadataFor } from '@/lib/metadata'

import nextConfig from '../../next.config'

// Front-end-site ticket 03: what every page tells the world about itself (D19, NFR-04).

// Typed out rather than read from site.url, so a typo in the config fails.
const ORIGIN = 'https://www.care4mind.xyz'

describe('the canonical origin', () => {
  it('is www.care4mind.xyz until launch, with no trailing slash', () => {
    expect(config.url).toBe(ORIGIN)
  })
})

describe('a page’s metadata (D19)', () => {
  it('names a Concept by its term and gloss, describes it by its summary and gives its address', async () => {
    expect(await metadataFor('/concepts/vikshepa/')).toEqual({
      title: { absolute: 'Vikṣepa (Distraction) · Care4Mind' },
      description:
        'The challenges a seeker encounters on the path to liberation. The Yoga Sūtra names nine obstacles, or diversions, on the yoga path.',
      alternates: { canonical: `${ORIGIN}/concepts/vikshepa/` },
    })
  })

  it('describes a topic, which has no summary, by what its page holds', async () => {
    expect(await metadataFor('/topics/mind/')).toEqual({
      title: { absolute: 'Mind: states and obstacles · Care4Mind' },
      description:
        '5 Concepts in the topic “Mind: states and obstacles”, and the verses they quote.',
      alternates: { canonical: `${ORIGIN}/topics/mind/` },
    })
  })

  it('describes a traditional text by what its page holds', async () => {
    expect(await metadataFor('/texts/yoga-sutra/')).toEqual({
      title: { absolute: 'Yoga Sūtra · Care4Mind' },
      description:
        'Every verse of the Yoga Sūtra that Care4Mind quotes, with its translations and the Concepts that quote it.',
      alternates: { canonical: `${ORIGIN}/texts/yoga-sutra/` },
    })
  })

  it('describes a Library page by its summary, and a reading list by its size', async () => {
    expect(await metadataFor('/library/methods/')).toEqual({
      title: { absolute: 'Methods · Care4Mind' },
      description:
        'Psychotherapy, also known as talk therapy, involves various techniques to help individuals enhance their mental and emotional well-being.',
      alternates: { canonical: `${ORIGIN}/library/methods/` },
    })
    expect(await metadataFor('/library/textbooks/')).toEqual({
      title: { absolute: 'Text Books · Care4Mind' },
      description: '20 entries on the Text Books list in the Care4Mind Library.',
      alternates: { canonical: `${ORIGIN}/library/textbooks/` },
    })
  })

  it('gives /search/ its address without the query, whatever was searched', async () => {
    const search = {
      title: { absolute: 'Search · Care4Mind' },
      description: 'Search Care4Mind for a Concept, a term, a verse, a text or a Reference.',
      alternates: { canonical: `${ORIGIN}/search/` },
    }
    expect(await metadataFor('/search/')).toEqual(search)
    expect(await metadataFor('/search/?q=vikshepa')).toEqual(search)
  })

  it('keeps the homepage’s own title, and describes it by the site’s tagline', async () => {
    expect(await metadataFor('/')).toEqual({
      title: { absolute: 'Care4Mind: Indian psychology' },
      description: 'Indic ways to invoke a perfect balanced mind',
      alternates: { canonical: `${ORIGIN}/` },
    })
  })

  it('names the flow after the Questionnaire it takes', async () => {
    expect(await metadataFor('/questionnaires/karmayoga-scale/take/')).toMatchObject({
      title: { absolute: 'Take the KarmaYoga Scale · Care4Mind' },
      alternates: { canonical: `${ORIGIN}/questionnaires/karmayoga-scale/take/` },
    })
  })

  it('gives every page in the registry a title, a description and its own canonical address', async () => {
    for (const route of await site.routes()) {
      const { title, description, alternates } = await metadataFor(route.path)
      const name = route.path === '/' ? 'Care4Mind: Indian psychology' : / · Care4Mind$/
      expect(title, route.path).toEqual({ absolute: expect.stringMatching(name) })
      expect(description, route.path).toMatch(/\S/)
      expect(alternates?.canonical, route.path).toBe(`${ORIGIN}${route.path}`)
    }
  })

  it('answers 404 for a path that is no page in this build', async () => {
    await expect(metadataFor('/nowhere/')).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404')
    await expect(metadataFor('/topics/')).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404')
  })
})

describe('the sitemap and robots.txt (NFR-04)', () => {
  it('lists every route in the registry once, at its production address, with its slash', async () => {
    const urls = (await sitemap()).map(({ url }) => url)
    const paths = (await site.routes()).map(({ path }) => path)
    expect(urls).toEqual(paths.map((path) => `${ORIGIN}${path}`))
    expect(new Set(urls).size).toBe(urls.length)
    for (const url of urls) expect(url.slice(ORIGIN.length)).toMatch(/^\/(?:[a-z0-9-]+\/)*$/)
    expect(urls).toEqual(
      expect.arrayContaining([
        `${ORIGIN}/`,
        `${ORIGIN}/concepts/vikshepa/`,
        `${ORIGIN}/texts/yoga-sutra/`,
        `${ORIGIN}/library/references/`,
      ]),
    )
  })

  it('names the sitemap in robots.txt and blocks nothing: noindex does the hiding', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: `${ORIGIN}/sitemap.xml`,
    })
  })
})

describe('addresses and redirects (D02, D17)', () => {
  it('ends every address with a slash', () => {
    expect(nextConfig.trailingSlash).toBe(true)
  })

  it('sends /topics/ to the Concepts A–Z, from the one redirect table', () => {
    expect(redirects).toContainEqual({ source: '/topics/', destination: '/concepts/' })
  })

  it('redirects by the table alone, each a 301 rather than Next’s default 308', async () => {
    const served = (await nextConfig.redirects?.()) ?? []
    expect(served).toHaveLength(redirects.length)
    expect(served).toContainEqual({
      source: '/topics/',
      destination: '/concepts/',
      statusCode: 301,
    })
    for (const redirect of served) expect(redirect).toMatchObject({ statusCode: 301 })
  })

  it('sends each redirect to a page in the route registry', async () => {
    const paths = new Set((await site.routes()).map(({ path }) => path))
    for (const { destination } of redirects) expect(paths).toContain(destination.split('#')[0])
  })
})

describe('breadcrumbs (D15)', () => {
  const labels = async (path: string) => (await site.trail(path)).map(({ label }) => label)

  it('leads a Concept through its primary topic, each crumb a link, the Concept last', async () => {
    expect(await site.trail('/concepts/vikshepa/')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Concepts', href: '/concepts/' },
      { label: 'Mind: states and obstacles', href: '/topics/mind/' },
      { label: 'Vikṣepa', href: '/concepts/vikshepa/', lang: 'sa-Latn' },
    ])
  })

  it('gives one page of every other kind design B6’s trail', async () => {
    expect(await labels('/concepts/')).toEqual(['Home', 'Concepts'])
    expect(await labels('/concepts/map/')).toEqual(['Home', 'Concepts', 'Concept map'])
    expect(await labels('/topics/values/')).toEqual(['Home', 'Concepts', 'Values: yama and niyama'])
    expect(await labels('/texts/')).toEqual(['Home', 'Traditional texts'])
    expect(await labels('/texts/yoga-sutra/')).toEqual(['Home', 'Traditional texts', 'Yoga Sūtra'])
    expect(await labels('/questionnaires/')).toEqual(['Home', 'Questionnaires'])
    expect(await labels('/questionnaires/karmayoga-scale/')).toEqual([
      'Home',
      'Questionnaires',
      'KarmaYoga Scale',
    ])
    expect(await labels('/questionnaires/karmayoga-scale/take/')).toEqual([
      'Home',
      'Questionnaires',
      'KarmaYoga Scale',
      'Take it',
    ])
    expect(await labels('/library/')).toEqual(['Home', 'Library'])
    expect(await labels('/library/references/')).toEqual(['Home', 'Library', 'References'])
    expect(await labels('/library/textbooks/')).toEqual(['Home', 'Library', 'Text Books'])
    expect(await labels('/library/methods/')).toEqual(['Home', 'Library', 'Methods'])
    expect(await labels('/search/')).toEqual(['Home', 'Search'])
    expect(await labels('/proposals/')).toEqual(['Home', 'Proposals'])
  })
})

describe('every internal link comes from hrefFor() (lint)', { timeout: 30_000 }, () => {
  const eslint = new ESLint({ cwd: process.cwd() })

  /** The messages of the hrefFor rule for a snippet placed in a page. */
  async function typedPaths(code: string): Promise<string[]> {
    const [result] = await eslint.lintText(code, { filePath: 'src/app/fixture/page.tsx' })
    return (result?.messages ?? [])
      .filter((message) => message.ruleId === 'care4mind/href-from-hreffor')
      .map((message) => message.message)
  }

  it('refuses an internal path typed into an href, however it is written', async () => {
    for (const code of [
      'export const a = <a href="/concepts/">A–Z</a>',
      "export const a = <a href={'/texts/'}>Texts</a>",
      'export const a = (slug: string) => <a href={`/concepts/${slug}/`}>A Concept</a>',
      "export const a = (q: string) => <a href={'/search/?q=' + q}>Search</a>",
      "export const a = (on: boolean) => <a href={on ? '/proposals/' : '#main'}>Maybe</a>",
      "export const a = <a href={'/library/' as string}>Library</a>",
      "export const crumb = { label: 'Home', href: '/' }",
    ])
      expect(await typedPaths(code), code).toHaveLength(1)
  })

  it('lets hrefFor(), fragments, other sites and paths a view made through', async () => {
    for (const code of [
      "import { hrefFor } from '@/content'\nexport const a = <a href={hrefFor({ page: 'concepts' })}>A–Z</a>",
      'export const a = <a href="#main">Skip to content</a>',
      'export const a = <a href="https://doi.org/10.1177/14705958221111239">doi</a>',
      'export const a = <a href="//dharmawiki.org/">DharmaWiki</a>',
      'export const a = (concept: { href: string }) => <a href={concept.href}>A Concept</a>',
      "export const crumb = { label: 'Home', href: '#main' }",
    ])
      expect(await typedPaths(code), code).toEqual([])
  })
})
