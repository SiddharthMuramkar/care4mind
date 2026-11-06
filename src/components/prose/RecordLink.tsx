import Link from 'next/link'

import type { RecordRef } from '@/content'

import { turnForward } from '../PageTurn'

/** A link to a record that quotes a verse or cites a Reference, named as its page names it. */
export function RecordLink({ record }: { record: RecordRef }) {
  return (
    <Link href={record.href} transitionTypes={turnForward}>
      <span lang={record.lang}>{record.title}</span>
      {record.gloss ? <> · {record.gloss}</> : null}
    </Link>
  )
}
