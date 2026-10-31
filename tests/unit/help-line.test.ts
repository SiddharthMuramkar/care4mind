import { describe, expect, it } from 'vitest'

import { home } from '@/content'
import { localSource } from '@/content/source'
import { helpLineParts } from '@/lib/help-line'

describe('the help line', () => {
  it('turns each phone number into a tel: link on its digits, and leaves the rest as text', () => {
    expect(helpLineParts('Call 14416 or 1-800-891-4416 (24×7, 20 languages). Else 112.')).toEqual([
      'Call ',
      { number: '14416', tel: 'tel:14416' },
      ' or ',
      { number: '1-800-891-4416', tel: 'tel:18008914416' },
      ' (24×7, 20 languages). Else ',
      { number: '112', tel: 'tel:112' },
      '.',
    ])
  })

  it('is stored on the homepage record, dials only phone numbers and is listed as drafted', async () => {
    const { helpLine } = await home.get()
    const digits = helpLineParts(helpLine).flatMap((part) =>
      typeof part === 'string' ? [] : [part.tel.slice('tel:'.length)],
    )
    expect(digits.length).toBeGreaterThan(0)
    // Indian short codes are 3 or 5 digits and full numbers 10 or more, so a year or a range is caught here.
    for (const number of digits)
      expect([3, 5].includes(number.length) || number.length >= 10).toBe(true)
    const [record] = await localSource.records('home')
    expect(record?.provenance.drafted).toContain('helpLine')
  })
})
