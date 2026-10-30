import type { ReactNode } from 'react'

import type { LatinScript } from '@/content'

export interface ScriptPairProps {
  /** The transliteration (IAST): a name, or a verse's lines. */
  iast: ReactNode
  /** Its language: Sanskrit unless the text is Pali (the Dhammapada). */
  lang?: LatinScript
  /** The Devanagari, where there is one; without it the pair is the transliteration alone. */
  devanagari?: ReactNode
  /** `span` for a name within a line, `div` for verses set as blocks. */
  as?: 'span' | 'div'
  className?: string
  /** Each spelling's own class, so a heading can set the two at different sizes. */
  iastClassName?: string
  devanagariClassName?: string
}

/**
 * Slot, added by front-end-site ticket 04 and filled by ticket 13: a term's two spellings,
 * always IAST then Devanagari in the DOM, so what a screen reader hears never changes, each
 * with its language tag (WCAG 3.1.2). Ticket 13 orders them on screen from `html[data-script]`
 * with CSS alone; this stub shows them in DOM order.
 */
export function ScriptPair({
  iast,
  lang = 'sa-Latn',
  devanagari,
  as: Tag = 'span',
  className,
  iastClassName,
  devanagariClassName,
}: ScriptPairProps) {
  return (
    <Tag className={className}>
      <Tag lang={lang} className={iastClassName}>
        {iast}
      </Tag>
      {devanagari ? (
        <>
          {' '}
          <Tag lang="sa-Deva" className={devanagariClassName}>
            {devanagari}
          </Tag>
        </>
      ) : null}
    </Tag>
  )
}
