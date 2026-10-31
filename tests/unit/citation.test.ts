import { beforeAll, describe, expect, it } from 'vitest'

import { citationParts, citationText, type CitationSource } from '@/components/citation'
import { references, type ReferenceView } from '@/content'

let all: ReferenceView[] = []

beforeAll(async () => {
  all = await references.list()
})

function reference(id: string): ReferenceView {
  const found = all.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`No Reference “${id}”.`)
  return found
}

describe('citationParts', () => {
  it('prints sudrajat-2017 with its container and its publisher', () => {
    expect(citationText(reference('sudrajat-2017'))).toBe(
      'Sudrajat, D. & Universitas Pendidikan Indonesia. (2017). Adaptation of Teenage Nonviolence Test to measure the peacefulness of senior high school students. Proceedings of the 1st International Conference on Educational Sciences (ICES 2017) – Volume 1, 127–132, SCITEPRESS – Science and Technology Publications, Lda. scitepress.org',
    )
  })

  it('puts a stop between a yearless author and the title', () => {
    expect(citationText(reference('boniwell'))).toBe(
      'Ilona Boniwell. Positive Psychology in a Nutshell: The Science of Happiness. amazon.com',
    )
    expect(citationText(reference('compton'))).toBe(
      'William Compton. Introduction to Positive Psychology. amazon.com',
    )
  })

  it('prints ignou-2017 as IGNOU. (2017).', () => {
    expect(citationText(reference('ignou-2017'))).toBe(
      'IGNOU. (2017). Unit-5 Brief History of Indian Metaphysics. Egyankosh.ac.in. hdl.handle.net',
    )
    expect(citationText(reference('ignou-2017')).startsWith('IGNOU. (2017).')).toBe(true)
  })

  it('ends khalil-2001 at Knopf Inc. with one stop', () => {
    const text = citationText(reference('khalil-2001'))
    expect(text).toBe('Khalil, G. (2001). The prophet. Alfred. A. Knopf Inc. amazon.in')
    expect(text.endsWith('Knopf Inc. amazon.in')).toBe(true)
    expect(text).not.toContain('Inc..')
  })

  it('keeps a DOI link and a URL link as they were', () => {
    expect(citationParts(reference('ryff-2021')).link).toEqual({
      href: 'https://doi.org/10.3390/rel12110914',
      label: 'doi:10.3390/rel12110914',
    })
    expect(citationText(reference('ryff-2021'))).toBe(
      'Ryff, C. D. (2021). Spirituality and Well-Being: Theory, Science, and the Nature connection. Religions, 12(11), 914. doi:10.3390/rel12110914',
    )
    expect(citationParts(reference('khalil-2001')).link).toEqual({
      href: 'https://www.amazon.in/Prophet-Kahlil-Gibran/dp/8129105632',
      label: 'amazon.in',
    })
  })

  it('prefers a DOI when a URL is recorded too, and adds no second stop', () => {
    const both: CitationSource = {
      title: 'What is yoga?',
      authors: 'Patanjali',
      doi: '10.1000/yoga',
      url: 'https://www.example.com/yoga',
      publisher: 'Who knows?',
    }
    expect(citationParts(both).link).toEqual({
      href: 'https://doi.org/10.1000/yoga',
      label: 'doi:10.1000/yoga',
    })
    expect(citationText(both)).toBe('Patanjali. What is yoga? Who knows? doi:10.1000/yoga')
    expect(citationText({ title: 'Done.', authors: 'A. B.' })).toBe('A. B. Done.')
  })
})
