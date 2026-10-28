import { concepts } from '@/content'

import { expect, gotoReady, inScope, test } from './fixtures'
import { ROUTES } from './routes'

// FR-01, the one-click test (front-end-site ticket 05): everything a Concept's view says it links
// to is a link in its Linked knowledge panel, and each link lands on a page that holds its anchor.
// The sample scope reads the sample Concept; the full scope reads all 19.

const CONCEPTS = inScope(ROUTES.filter((route) => route.kind === 'concept'))

for (const { path } of CONCEPTS) {
  test(`${path}: every related Concept, work, section, Reference and Questionnaire is one click away`, async ({
    page,
    request,
  }) => {
    const slug = path.split('/').at(-2) ?? ''
    const concept = await concepts.get(slug)
    expect(concept, `${slug} has a view`).toBeTruthy()
    if (!concept) return
    await gotoReady(page, path)
    const panel = page.getByRole('region', { name: 'Linked knowledge' })
    const hrefs = new Set(
      await panel
        .locator('a[href]')
        .evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
    )

    const wanted = [
      ...concept.linked.related.map((other) => other.href),
      ...concept.linked.works.flatMap((work) => [work.href, ...work.passages.map((p) => p.href)]),
      ...concept.linked.sections.map((section) => `#${section.id}`),
      ...concept.references.map((reference) => `#${reference.anchor}`),
      ...concept.linked.questionnaires.map((questionnaire) => questionnaire.href),
    ]
    for (const href of wanted) expect(hrefs, `${path} links ${href}`).toContain(href)

    // Each target answers and holds its anchor: on this page, or on the page it opens.
    const pages = new Map<string, string>()
    for (const href of wanted) {
      const [target = path, anchor] = href.startsWith('#') ? [path, href.slice(1)] : href.split('#')
      if (!pages.has(target)) {
        const response = await request.get(target)
        expect(response.status(), `${target} answers`).toBe(200)
        pages.set(target, await response.text())
      }
      if (anchor) expect(pages.get(target), `${href} has its anchor`).toContain(`id="${anchor}"`)
    }
  })
}
