'use client'

import { toast } from '@/components/toast/toast'

import styles from './references.module.css'

/**
 * The citation an entry shows, as plain text: its words as set, then its DOI or address in full
 * (`https://doi.org/…`) where the page shows only a short link.
 */
function plainCitation(entry: Element): string | undefined {
  const citation = entry.querySelector('[data-citation]')
  if (!citation) return undefined
  const words = (citation.textContent ?? '').replace(/\s+/g, ' ').trim()
  const link = entry.querySelector<HTMLAnchorElement>('a[data-source]')?.href
  return link ? `${words} ${link}` : words
}

/**
 * "Copy citation": puts its entry's citation on the clipboard as plain text, read from the entry
 * itself so it is always the one shown, and says so in a polite toast.
 */
export function CopyCitation({
  label,
}: {
  /** The citation in brief, "Jain & Diwakar (2019)": the rest of the button's name, and the toast's. */
  label: string
}) {
  async function copy(button: HTMLButtonElement) {
    const entry = button.closest('[data-entry]')
    const text = entry ? plainCitation(entry) : undefined
    try {
      if (!text) throw new Error('No citation beside this button.')
      await navigator.clipboard.writeText(text)
      toast({ title: 'Citation copied', description: label })
    } catch {
      toast({
        title: 'The citation wasn’t copied',
        description: 'Select its text to copy it instead.',
      })
    }
  }
  return (
    <button
      type="button"
      className={styles.copy}
      onClick={(event) => void copy(event.currentTarget)}
      data-ink
    >
      <span className={styles.copyIcon} aria-hidden />
      Copy citation
      <span className="sr-only"> {label}</span>
    </button>
  )
}
