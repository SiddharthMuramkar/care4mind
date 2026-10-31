/** A phone number in the help line, with the `tel:` address its digits dial. */
export interface PhoneNumber {
  number: string
  tel: string
}

// Three or more digits, hyphens allowed inside: 112, 14416, 1-800-891-4416, but not 24 or 20.
const PHONE = /\d[\d-]+\d/g

/** The help line split into plain text and phone numbers, in reading order. */
export function helpLineParts(text: string): (string | PhoneNumber)[] {
  const parts: (string | PhoneNumber)[] = []
  let last = 0
  for (const match of text.matchAll(PHONE)) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push({ number: match[0], tel: `tel:${match[0].replaceAll('-', '')}` })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
