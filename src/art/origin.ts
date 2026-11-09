import type { ArtOrigin } from './types'

const MONTH = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Where a picture came from, in the words of the plain list of sources and nowhere else. */
export function originLine(origin: ArtOrigin): string {
  switch (origin.kind) {
    case 'care4mind':
      return 'From the Care4Mind website'
    case 'generated':
      return `Made with ${origin.tool} from the Care4Mind style, ${MONTH.format(new Date(origin.made))}`
    case 'licensed':
      return origin.credit
  }
}
