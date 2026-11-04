import { hrefFor, type HomepageHero } from '@/content'

/** One of the opening folio's links; the first is the primary button. */
export interface HeroLink {
  label: string
  href: string
}

/** The opening folio's links: Start here and Browse concepts while Start here is on, else Explore concepts. */
export function heroLinks(hero: HomepageHero, startHere: boolean): readonly HeroLink[] {
  const concepts = hrefFor({ page: 'concepts' })
  return startHere
    ? [
        { label: hero.startHere, href: hrefFor({ page: 'start' }) },
        { label: hero.browseConcepts, href: concepts },
      ]
    : [{ label: hero.exploreConcepts, href: concepts }]
}
