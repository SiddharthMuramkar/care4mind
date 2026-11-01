import { home } from '@/content'
import { helpLineParts } from '@/lib/help-line'

/** Where to call for help now, in the homepage record's words, each number a `tel:` link. */
export async function HelpLine({ className }: { className?: string }) {
  const { helpLine } = await home.get()
  return (
    <p className={className} data-help-line="">
      {helpLineParts(helpLine).map((part, index) =>
        typeof part === 'string' ? (
          part
        ) : (
          <a key={index} href={part.tel}>
            {part.number}
          </a>
        ),
      )}
    </p>
  )
}
