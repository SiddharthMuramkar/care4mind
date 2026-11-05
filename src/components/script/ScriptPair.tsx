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
 * The one place a term's two spellings are drawn: IAST, then Devanagari, each with its language
 * tag (WCAG 3.1.2), in the same order on screen and to a screen reader.
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
