import { expect, gotoReady, test } from './fixtures'

// A page's title block earns its height: at most 40% of a laptop's screen and half a phone's, so
// the text starts within the first screen. From 48rem its picture stands beside the title.

const TEMPLATES = [
  '/concepts/',
  '/concepts/vikshepa/',
  '/topics/mind/',
  '/texts/',
  '/texts/yoga-sutra/',
  '/library/',
  '/library/references/',
  '/questionnaires/',
  '/questionnaires/karmayoga-scale/',
  '/search/',
]

for (const { width, height, share } of [
  { width: 1280, height: 800, share: 0.4 },
  { width: 360, height: 800, share: 0.5 },
]) {
  test.describe(`at ${width}×${height}`, { tag: '@self-width' }, () => {
    test.use({ viewport: { width, height } })

    for (const path of TEMPLATES) {
      test(`${path}: the title block is at most ${share * 100}% of the screen`, async ({
        page,
      }) => {
        await gotoReady(page, path)
        const header = page.getByRole('main').locator('header').first()
        const box = await header.boundingBox()
        expect(box?.height ?? Infinity).toBeLessThanOrEqual(height * share)
        if (width >= 768) {
          const picture = header.locator('img, svg').first()
          if ((await picture.count()) === 0) return
          const [art, title] = [
            await picture.boundingBox(),
            await header.locator('h1').boundingBox(),
          ]
          if (!art || !title) throw new Error('the picture and title are on the page')
          expect(art.x + art.width, 'the picture stands beside the title').toBeLessThanOrEqual(
            title.x + 1,
          )
        }
      })
    }
  })
}
