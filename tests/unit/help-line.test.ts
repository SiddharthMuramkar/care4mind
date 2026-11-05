import { describe, expect, it } from 'vitest'

import { home } from '@/content'
import { localSource } from '@/content/source'
import { helpLineParts } from '@/lib/help-line'

describe('the help line', () => {
  it('turns each phone number into a tel: link on its digits, named digit by digit, and leaves the rest as text', () => {
    expect(helpLineParts('Call 14416 or 1-800-891-4416 (24×7, 20 languages). Else 112.')).toEqual([
      'Call ',
      { number: '14416', tel: 'tel:14416', label: '14416: 1 4 4 1 6' },
      ' or ',
      {
        number: '1-800-891-4416',
        tel: 'tel:18008914416',
        label: '1-800-891-4416: 1, 8 0 0, 8 9 1, 4 4 1 6',
      },
      ' (24×7, 20 languages). Else ',
      { number: '112', tel: 'tel:112', label: '112: 1 1 2' },
      '.',
    ])
  })

  it('is stored on the homepage record, dials Tele-MANAS and emergency, and is listed as drafted', async () => {
    const { helpLine } = await home.get()
    const digits = helpLineParts(helpLine).flatMap((part) =>
      typeof part === 'string' ? [] : [part.tel.slice('tel:'.length)],
    )
    // Pinning these numbers makes changing where a person in crisis is sent a deliberate edit.
    expect(digits.length).toBe(3)
    expect(new Set(digits)).toEqual(new Set(['14416', '18008914416', '112']))
    // Indian short codes are 3 or 5 digits and full numbers 10 or more, so a year or a range is caught here.
    for (const number of digits)
      expect([3, 5].includes(number.length) || number.length >= 10).toBe(true)
    const [record] = await localSource.records('home')
    expect(record?.provenance.drafted).toContain('helpLine')
  })
})
