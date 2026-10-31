'use client'

import type { LatinScript } from '@/content'

import { toast } from '../toast'
import styles from './Prose.module.css'

/** "Copy verse": puts the verse on the clipboard as plain text, and says so in a polite toast. */
export function CopyVerse({
  text,
  source,
  lang,
}: {
  text: string
  /** The verse's work and locator, "Yoga Sūtra 1.30": the button's full name, and the toast's. */
  source: string
  lang: LatinScript
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: 'Verse copied', description: source })
    } catch {
      toast({
        title: 'The verse wasn’t copied',
        description: 'Select its text to copy it instead.',
      })
    }
  }
  return (
    <button type="button" className={styles.copy} onClick={() => void copy()} data-ink>
      Copy verse
      <span className="sr-only">
        {' '}
        <span lang={lang}>{source}</span>
      </span>
    </button>
  )
}
