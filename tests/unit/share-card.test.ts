import { join } from 'node:path'

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { art } from '@/art'
import { site } from '@/content'
import { cardPicture } from '@/lib/share-card'

// The picture each share card draws.

describe('the picture on a share card', () => {
  it.each(['/', '/proposals/', '/credits/', '/credits/sources/'])(
    '%s carries the Emblem',
    async (pattern) => {
      expect((await cardPicture(pattern, '')).id).toBe('emblem-ring')
    },
  )

  it("on a take page is its Questionnaire's", async () => {
    const takeable = (await site.routes()).filter((route) => route.kind === 'questionnaire-flow')
    expect(takeable.length).toBeGreaterThan(0)
    for (const route of takeable) {
      const slug = route.record?.id ?? ''
      const take = await cardPicture('/questionnaires/[slug]/take/', slug)
      expect(take, route.path).toEqual(await cardPicture('/questionnaires/[slug]/', slug))
    }
  })

  it('on a topic is its Frontispiece, not its card Sticker', async () => {
    expect((await cardPicture('/topics/[slug]/', 'mind')).id).toBe('plate-sage-paints-mind')
  })

  it("on a section is that section's Sticker", async () => {
    expect(await cardPicture('/texts/', '')).toEqual(art('sticker-book-ornate'))
    expect(await cardPicture('/library/[slug]/', 'courses')).toEqual(art('sticker-gear'))
  })

  it('has a 320 px PNG or JPEG copy on disk, the only formats a card can draw', async () => {
    for (const route of await site.routes()) {
      const { src } = await cardPicture(route.pattern, route.record?.id ?? '')
      const file = join(process.cwd(), 'art/cards', src.replace('/art/', ''))
      const { width, height, format } = await sharp(file).metadata()
      expect({ width, height }, route.path).toEqual({ width: 320, height: 320 })
      expect(['png', 'jpeg'], route.path).toContain(format)
    }
  })

  it('refuses a route nobody chose a picture for', async () => {
    await expect(cardPicture('/nonesuch/', '')).rejects.toThrow('/nonesuch/')
  })
})
