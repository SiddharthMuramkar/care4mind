/** A phone number in the help line, with the `tel:` address its digits dial and the name assistive technology announces. */
export interface PhoneNumber {
  number: string
  tel: string
  label: string
}

// The visible number first, so voice control can name the link as seen, then its digits spaced so a screen reader says them one by one, not as a quantity.
function labelFor(number: string): string {
  const digits = number
    .split('-')
    .map((group) => [...group].join(' '))
    .join(', ')
  return `${number}: ${digits}`
}

// Three or more digits, hyphens allowed inside: 112, 14416, 1-800-891-4416, but not 24 or 20.
const PHONE = /\d[\d-]+\d/g

/** The help line split into plain text and phone numbers, in reading order. */
export function helpLineParts(text: string): (string | PhoneNumber)[] {
  const parts: (string | PhoneNumber)[] = []
  let last = 0
  for (const match of text.matchAll(PHONE)) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push({
      number: match[0],
      tel: `tel:${match[0].replaceAll('-', '')}`,
      label: labelFor(match[0]),
    })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
