import { beforeAll, describe, expect, it } from 'vitest'

import { standingIn } from '@/components/prose/Blocks'
import { provenanceSentence } from '@/components/prose/Provenance'
import { citedIn, parenthesised, type CitationLinks } from '@/components/prose/Text'
import { verseAsText } from '@/components/prose/VerseCard'
import { concepts, references, type CarriedOver, type SectionView, type VerseView } from '@/content'

const entry = (anchor: string): CitationLinks[string] => ({
  anchor,
  preview: { kind: 'reference', name: anchor, text: anchor },
})

describe('parenthesised and citedIn', () => {
  it('finds both citations in "(A, 2020; B, 2021)"', () => {
    const text = 'See (A, 2020; B, 2021) here.'
    const links: CitationLinks = { 'A, 2020': entry('a'), 'B, 2021': entry('b') }
    expect(parenthesised(text)).toEqual([{ start: 5, inside: 'A, 2020; B, 2021' }])
    expect(citedIn(text, links).map(({ start, cited }) => ({ start, cited }))).toEqual([
      { start: 5, cited: 'A, 2020' },
      { start: 14, cited: 'B, 2021' },
    ])
  })

  it('reads a citation nested inside another pair at its own offset', () => {
    const text = '(A, 2020; (B, 2021))'
    expect(parenthesised(text)).toEqual([
      { start: 1, inside: 'A, 2020; (B, 2021)' },
      { start: 11, inside: 'B, 2021' },
    ])
    const links: CitationLinks = { 'A, 2020': entry('a'), 'B, 2021': entry('b') }
    expect(citedIn(text, links).map(({ start, cited }) => ({ start, cited }))).toEqual([
      { start: 1, cited: 'A, 2020' },
      { start: 11, cited: 'B, 2021' },
    ])
  })
})

describe('provenanceSentence', () => {
  let navare: CarriedOver | undefined

  beforeAll(async () => {
    navare = (await references.list()).find((candidate) => candidate.id === 'navare-pandey-2022')
  })

  it('says a record was taken from somewhere other than the current site', () => {
    if (!navare) throw new Error('No Reference “navare-pandey-2022”.')
    expect(provenanceSentence(navare)).toBe(
      'Taken from doi.org/10.1177/14705958221111239, read on 2026-10-26. Not yet reviewed by the Research editor.',
    )
  })

  it('lists current-site pages, the drafted fields and a review', () => {
    const of: CarriedOver = {
      reviewStatus: 'reviewed',
      provenance: {
        sources: [
          { url: 'https://care4mind.org/b/', retrieved: '2026-02-01' },
          { url: 'https://www.care4mind.org/a/', retrieved: '2026-01-01' },
        ],
        edits: [],
        flags: [],
        drafted: ['summary', 'table', 'note'],
      },
    }
    expect(provenanceSentence(of)).toBe(
      'Carried over from the current site\u2019s pages care4mind.org/b/ and www.care4mind.org/a/, read on 2026-01-01 and 2026-02-01; its summary, table and note were drafted for the new site. Reviewed.',
    )
  })
})

describe('verseAsText', () => {
  const verse: VerseView = {
    source: 'Work 1.1',
    verse: '1.1',
    devanagari: ['line one', 'line two'],
    transliteration: ['translit'],
    transliterationScheme: 'iast',
    translation: 'A translation',
    translationSource: 'Someone',
    passage: 'work/1.1',
    work: { slug: 'work', title: 'Work', lang: 'sa-Latn', href: '/texts/work/' },
    href: '/texts/work/#1-1',
  }

  it('joins the lines, the translation with its source, and the locator', () => {
    expect(verseAsText(verse)).toBe(
      'line one\nline two\n\ntranslit\n\nA translation (Someone)\n\nWork 1.1',
    )
  })

  it('leaves out an empty translation', () => {
    expect(verseAsText({ ...verse, translation: '', translationSource: undefined })).toBe(
      'line one\nline two\n\ntranslit\n\nWork 1.1',
    )
  })
})

function shared(heading: string): SectionView {
  return {
    id: 'yama-niyama',
    heading: 'Yama and niyama',
    href: '/concepts/ahimsa/#yama-niyama',
    blocks: [
      {
        kind: 'topic-intro',
        topic: { slug: 'values', name: 'Values', href: '/topics/values/' },
        sections: [
          {
            id: 'yama-niyama',
            heading,
            href: '/topics/values/#yama-niyama',
            blocks: [{ kind: 'paragraph', text: 'Yama.' }],
          },
          {
            id: 'elsewhere',
            heading: 'Elsewhere',
            href: '/topics/values/#elsewhere',
            blocks: [{ kind: 'paragraph', text: 'Other.' }],
          },
        ],
      },
    ],
  }
}

describe('standingIn', () => {
  it('stands in for the shared section only when the id and the heading are the same', () => {
    const match = standingIn(shared('Yama and niyama'))
    expect(match?.own.heading).toBe('Yama and niyama')
    expect(match?.others.map((section) => section.id)).toEqual(['elsewhere'])
    expect(standingIn(shared('A different heading'))).toBeUndefined()
  })

  it('stands in for the values introduction on Ahimsa', async () => {
    const concept = await concepts.get('ahimsa')
    const section = concept?.sections.find(
      (candidate) => candidate.id === 'raja-yoga-foundations-yama-niyama',
    )
    if (!section) throw new Error('Ahimsa has no yama–niyama section.')
    expect(standingIn(section)?.own.heading).toBe('Raja Yoga Foundations: Yama-Niyama')
  })
})
