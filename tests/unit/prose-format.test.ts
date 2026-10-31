import { describe, expect, it } from 'vitest'

import { citationParts } from '@/components/citation-parts'
import { citedIn, parenthesised } from '@/components/prose/in-text-citations'
import { provenanceSentence } from '@/components/prose/provenance-sentence'
import { standingIn } from '@/components/prose/standing-in'
import { verseAsText } from '@/components/prose/verse-text'
import { references, type CarriedOver, type SectionView, type VerseView } from '@/content'

/** A citation as it reads on the page, with its link's label at the end. */
function read(reference: Parameters<typeof citationParts>[0]): string {
  const parts = citationParts(reference)
  return [parts.authorship, `${parts.title}${parts.titleEnd}`, parts.publication, parts.link?.label]
    .filter(Boolean)
    .join(' ')
}

describe('citationParts', () => {
  it('shows a chapter’s container and its publisher, container first', () => {
    expect(
      read({
        authors: 'Sudrajat, D. & Universitas Pendidikan Indonesia',
        year: '2017',
        title: 'Adaptation of Teenage Nonviolence Test',
        container: 'Proceedings of ICES 2017 – Volume 1',
        publisher: 'SCITEPRESS – Science and Technology Publications, Lda.',
        pages: '127–132',
      }),
    ).toBe(
      'Sudrajat, D. & Universitas Pendidikan Indonesia. (2017). Adaptation of Teenage Nonviolence Test. Proceedings of ICES 2017 – Volume 1, 127–132, SCITEPRESS – Science and Technology Publications, Lda.',
    )
  })

  it('ends an author with no year with a stop before the title', () => {
    expect(read({ authors: 'Ilona Boniwell', title: 'Positive Psychology in a Nutshell' })).toBe(
      'Ilona Boniwell. Positive Psychology in a Nutshell.',
    )
    expect(read({ authors: 'William Compton', title: 'Introduction to Positive Psychology' })).toBe(
      'William Compton. Introduction to Positive Psychology.',
    )
  })

  it('stops the author before the year, as the carried-over citation does', () => {
    expect(citationParts({ authors: 'IGNOU', year: '2017', title: 'Unit-5' }).authorship).toBe(
      'IGNOU. (2017).',
    )
  })

  it('adds no second stop to an author or publisher that already ends in one', () => {
    expect(
      read({
        authors: 'Khalil, G.',
        year: '2001',
        title: 'The prophet',
        publisher: 'Alfred. A. Knopf Inc.',
      }),
    ).toBe('Khalil, G. (2001). The prophet. Alfred. A. Knopf Inc.')
  })

  it('adds no stop after a title that ends in a question mark', () => {
    expect(read({ title: 'Who am I?', edition: undefined })).toBe('Who am I?')
  })

  it('puts the edition before the title’s stop and the issue after the volume', () => {
    expect(
      read({
        authors: 'Rao, K.',
        year: '2001',
        title: 'Yoga',
        edition: '2nd ed.',
        container: 'Journal',
        volume: '4',
        issue: '2',
        pages: '1–9',
      }),
    ).toBe('Rao, K. (2001). Yoga (2nd ed.). Journal, 4(2), 1–9.')
  })

  it('links a DOI as doi:, and a URL by its host without www', () => {
    expect(citationParts({ title: 'A', doi: '10.1/x', url: 'https://www.a.org/b' }).link).toEqual({
      href: 'https://doi.org/10.1/x',
      label: 'doi:10.1/x',
    })
    expect(citationParts({ title: 'A', url: 'https://www.a.org/b' }).link).toEqual({
      href: 'https://www.a.org/b',
      label: 'a.org',
    })
    expect(citationParts({ title: 'A' }).link).toBeUndefined()
  })
})

describe('the carried-over References the audit found misprinted', () => {
  const cite = async (id: string) => {
    const found = (await references.list()).find((reference) => reference.id === id)
    if (!found) throw new Error(`No Reference “${id}”.`)
    return read(found)
  }

  it('prints each part once, with one stop', async () => {
    expect(await cite('sudrajat-2017')).toBe(
      'Sudrajat, D. & Universitas Pendidikan Indonesia. (2017). Adaptation of Teenage Nonviolence Test to measure the peacefulness of senior high school students. Proceedings of the 1st International Conference on Educational Sciences (ICES 2017) – Volume 1, 127–132, SCITEPRESS – Science and Technology Publications, Lda. scitepress.org',
    )
    expect(await cite('boniwell')).toBe(
      'Ilona Boniwell. Positive Psychology in a Nutshell: The Science of Happiness. amazon.com',
    )
    expect(await cite('compton')).toBe(
      'William Compton. Introduction to Positive Psychology. amazon.com',
    )
    expect(await cite('ignou-2017')).toBe(
      'IGNOU. (2017). Unit-5 Brief History of Indian Metaphysics. Egyankosh.ac.in. hdl.handle.net',
    )
    expect(await cite('khalil-2001')).toBe(
      'Khalil, G. (2001). The prophet. Alfred. A. Knopf Inc. amazon.in',
    )
  })
})

describe('in-text citations', () => {
  it('finds each pair of parentheses, outer pairs before nested ones', () => {
    //            0123456789012345678901234
    const text = 'a (b (c) d) e (f)'
    expect(parenthesised(text)).toEqual([
      { start: 3, inside: 'b (c) d' },
      { start: 6, inside: 'c' },
      { start: 15, inside: 'f' },
    ])
  })

  it('places each citation of a two-citation string where it sits', () => {
    const text = 'Calm (A, 2020; B, 2021).'
    const found = citedIn(text, { 'A, 2020': 'a', 'B, 2021': 'b' })
    expect(found).toEqual([
      { start: 6, cited: 'A, 2020', entry: 'a' },
      { start: 15, cited: 'B, 2021', entry: 'b' },
    ])
    for (const { start, cited } of found)
      expect(text.slice(start, start + cited.length)).toBe(cited)
  })

  it('finds a citation nested inside other parentheses, and skips text it can’t link', () => {
    const text = 'Calm (see also (A, 2020)) (C, 1999).'
    expect(citedIn(text, { 'A, 2020': 'a' })).toEqual([{ start: 16, cited: 'A, 2020', entry: 'a' }])
  })
})

const provenance = (
  urls: string[],
  reviewStatus: CarriedOver['reviewStatus'] = 'carried-over-not-reviewed',
  drafted?: string[],
): CarriedOver => ({
  provenance: {
    sources: urls.map((url, index) => ({ url, retrieved: `2026-10-2${index + 7}` })),
    edits: [],
    flags: [],
    drafted,
  },
  reviewStatus,
})

describe('provenanceSentence', () => {
  it('names the current site’s pages, the dates they were read and the review', () => {
    expect(
      provenanceSentence(provenance(['https://care4mind.org/a/', 'https://www.care4mind.org/b/'])),
    ).toEqual({
      opening: 'Carried over from the current site’s pages ',
      sources: [
        { url: 'https://care4mind.org/a/', label: 'care4mind.org/a/', before: '' },
        { url: 'https://www.care4mind.org/b/', label: 'www.care4mind.org/b/', before: ' and ' },
      ],
      closing: ', read on 2026-10-27 and 2026-10-28. Not yet reviewed by the Research editor.',
    })
  })

  it('says a record whose sources aren’t the current site’s was taken from them', () => {
    expect(
      provenanceSentence(
        provenance(['https://care4mind.org/a/', 'https://example.org/b'], 'reviewed', ['summary']),
      ),
    ).toEqual({
      opening: 'Taken from ',
      sources: [
        { url: 'https://care4mind.org/a/', label: 'care4mind.org/a/', before: '' },
        { url: 'https://example.org/b', label: 'example.org/b', before: ' and ' },
      ],
      closing:
        ', read on 2026-10-27 and 2026-10-28; its summary was drafted for the new site. Reviewed.',
    })
  })

  it('gives only the review for a record with no sources', () => {
    expect(provenanceSentence(provenance([], 'reviewed'))).toEqual({
      opening: '',
      sources: [],
      closing: 'Reviewed.',
    })
  })
})

describe('verseAsText', () => {
  it('sets the Devanagari, transliteration, translation with its source, and locator apart', () => {
    const verse = {
      source: 'Yoga Sūtra 2.30',
      devanagari: ['अहिंसा', 'यमाः'],
      transliteration: ['ahiṃsā', 'yamāḥ'],
      translation: 'Non-violence.',
      translationSource: 'Bryant',
    } as unknown as VerseView
    expect(verseAsText(verse)).toBe(
      'अहिंसा\nयमाः\n\nahiṃsā\nyamāḥ\n\nNon-violence. (Bryant)\n\nYoga Sūtra 2.30',
    )
    expect(verseAsText({ ...verse, translation: '' })).toBe(
      'अहिंसा\nयमाः\n\nahiṃsā\nyamāḥ\n\nYoga Sūtra 2.30',
    )
  })
})

describe('standingIn', () => {
  const inner = (id: string, heading: string): SectionView => ({
    id,
    heading,
    href: `#${id}`,
    blocks: [],
  })
  const holding = (id: string, heading: string, sections: SectionView[]): SectionView => ({
    id,
    heading,
    href: `#${id}`,
    blocks: [{ kind: 'topic-intro', topic: { id: 'values' }, sections } as never],
  })

  it('stands in for the topic introduction section with the same id and heading', () => {
    const own = inner('yama-niyama', 'Yama-Niyama')
    const other = inner('other', 'Other')
    const found = standingIn(holding('yama-niyama', 'Yama-Niyama', [own, other]))
    expect(found?.own).toBe(own)
    expect(found?.others).toEqual([other])
  })

  it('stands in for nothing when the heading differs', () => {
    expect(
      standingIn(holding('yama-niyama', 'Yama', [inner('yama-niyama', 'Yama-Niyama')])),
    ).toBeUndefined()
  })

  it('stands in for nothing when the section holds more than the introduction', () => {
    const section = holding('a', 'A', [inner('a', 'A')])
    expect(
      standingIn({ ...section, blocks: [...section.blocks, { kind: 'paragraph' } as never] }),
    ).toBeUndefined()
  })
})
