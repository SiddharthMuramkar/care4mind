import { Fragment, type ReactNode } from 'react'

/** A `lang` attribute only where there is one: an undefined prop still travels with the page. */
export const langOf = (lang: string | undefined) => (lang ? { lang } : {})

/** Names in words: "A", "A and B", "A, B and C". */
export function inWords(items: readonly ReactNode[]) {
  return items.map((item, index) => (
    <Fragment key={index}>
      {index === 0 ? null : index === items.length - 1 ? ' and ' : ', '}
      {item}
    </Fragment>
  ))
}
