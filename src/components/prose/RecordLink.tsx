import type { Route } from 'next'
import Link from 'next/link'

import type { RecordRef } from '@/content'

import { turnForward } from '@/components/page-turn'

/** A link to a record that quotes a verse or cites a Reference, named as its page names it. */
export function RecordLink({ record }: { record: RecordRef }) {
  return (
    // The record's path, made by hrefFor() in the content module.
    <Link href={record.href as Route} transitionTypes={turnForward}>
      <span lang={record.lang}>{record.title}</span>
    </Link>
  )
}
