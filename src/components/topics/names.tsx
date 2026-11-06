import { Fragment, type ReactNode } from 'react'

import { listSeparator } from '@/lib/text'

/** A `lang` attribute only where there is one: an undefined prop still travels with the page. */
export const langOf = (lang: string | undefined) => (lang ? { lang } : {})

/** Names in words: "A", "A and B", "A, B and C". */
export function inWords(items: readonly ReactNode[]) {
  return items.map((item, index) => (
    <Fragment key={index}>
      {listSeparator(index, items.length)}
      {item}
    </Fragment>
  ))
}
