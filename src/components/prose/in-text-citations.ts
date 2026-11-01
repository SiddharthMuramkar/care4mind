/**
 * Each pair of parentheses, where in-text citations sit ("(Tomar, 2024; Rao, 2001)"): its text
 * and where that starts, outer pairs before those nested in them, as the content module reads them.
 */
export function parenthesised(text: string): { start: number; inside: string }[] {
  const open: number[] = []
  const pairs: { start: number; inside: string }[] = []
  for (let at = 0; at < text.length; at++) {
    if (text[at] === '(') open.push(at)
    else if (text[at] === ')') {
      const start = open.pop()
      if (start !== undefined) pairs.push({ start: start + 1, inside: text.slice(start + 1, at) })
    }
  }
  return pairs.sort((a, b) => a.start - b.start)
}

/** Where each citation the page can link sits in the text, in reading order, none overlapping. */
export function citedIn<Entry>(text: string, citations: Readonly<Record<string, Entry>>) {
  const found: { start: number; cited: string; entry: Entry }[] = []
  for (const { start, inside } of parenthesised(text)) {
    let offset = start
    for (const part of inside.split(';')) {
      const cited = part.trim()
      const entry = citations[cited]
      if (entry !== undefined) found.push({ start: offset + part.indexOf(cited), cited, entry })
      offset += part.length + 1
    }
  }
  let end = 0
  return found
    .sort((a, b) => a.start - b.start)
    .filter(({ start, cited }) => {
      if (start < end) return false
      end = start + cited.length
      return true
    })
}
