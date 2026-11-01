import { home } from '@/content'
import { helpLineParts } from '@/lib/help-line'

import styles from './HelpLine.module.css'

/** Where to call for help now, in the homepage record's words, each number a `tel:` link. */
export async function HelpLine({ className }: { className?: string }) {
  const { helpLine } = await home.get()
  return (
    <p className={className} data-help-line="">
      {helpLineParts(helpLine).map((part, index) =>
        typeof part === 'string' ? (
          part
        ) : (
          <a
            key={index}
            href={part.tel}
            className={styles.number}
            // Screen readers say 112 as a quantity; the description reads it digit by digit and keeps the visible name.
            title={`Phone number ${part.tel.slice('tel:'.length).split('').join(' ')}`}
          >
            {part.number}
          </a>
        ),
      )}
    </p>
  )
}
