'use client'

import { type RefObject, useLayoutEffect, useRef } from 'react'

/** The share of the row each of its fades covers on a phone (AzIndex.module.css). */
const FADE = 0.12

/**
 * The rail's own sideways scrolling, where its letters run past its ends (one row on a phone).
 * It marks which ends have letters past them (`data-more` on the band, which the fades read),
 * and once the page comes to rest it brings the current letter into view: the one
 * `:target-current` marks, or where the browser has no such mark, the letter of the last
 * section begun above the band's foot. It moves the row only when that letter changes, so a
 * row the reader swiped stays where they left it while they read on in the same letter.
 *
 * Give the band the ref it returns. `list` holds the sections; `rail` is the row's component:
 * Base UI's replaces the plain one, and the new row takes the old one's place along it, so
 * nothing moves.
 */
export function useRail(list: RefObject<HTMLElement | null>, rail: unknown) {
  const band = useRef<HTMLElement>(null)
  const kept = useRef<{ left: number; letter?: string | undefined }>({ left: 0 })

  useLayoutEffect(() => {
    const nav = band.current
    const row = nav?.firstElementChild
    if (!nav || !(row instanceof HTMLElement)) return
    const was = kept.current
    row.scrollLeft = was.left
    const marks = CSS.supports('selector(:target-current)')

    const mark = () => {
      was.left = row.scrollLeft
      const more = [
        row.scrollLeft > 1 ? 'start' : '',
        row.scrollLeft + row.clientWidth < row.scrollWidth - 1 ? 'end' : '',
      ]
        .filter(Boolean)
        .join(' ')
      if (nav.dataset.more !== more) nav.dataset.more = more
    }

    const currentLetter = () => {
      if (marks) return row.querySelector<HTMLElement>(':target-current')
      const foot = nav.getBoundingClientRect().bottom
      let id: string | undefined
      for (const section of list.current?.querySelectorAll<HTMLElement>(
        '[data-letter]:not([hidden])',
      ) ?? []) {
        if (section.getBoundingClientRect().top > foot) break
        id = section.id
      }
      return id ? row.querySelector<HTMLElement>(`[data-rail="${id}"]`) : null
    }

    // A glide after a reader's scroll; a jump under reduced motion, and as the page opens.
    const follow = (glide: boolean) => {
      if (row.scrollWidth <= row.clientWidth + 1) return
      const letter = currentLetter()
      const id = letter?.dataset.rail
      if (!letter || id === was.letter) return
      was.letter = id
      const edge = row.clientWidth * FADE
      const left = letter.getBoundingClientRect().left - row.getBoundingClientRect().left
      if (left >= edge && left + letter.offsetWidth <= row.clientWidth - edge) return
      const smooth = glide && matchMedia('(prefers-reduced-motion: no-preference)').matches
      row.scrollTo({
        left: row.scrollLeft + left - (row.clientWidth - letter.offsetWidth) / 2,
        behavior: smooth ? 'smooth' : 'instant',
      })
    }

    let frame = 0
    const onRow = () => {
      if (frame === 0)
        frame = requestAnimationFrame(() => {
          frame = 0
          mark()
        })
    }
    // The page at rest: at its scrollend, or after a pause in its scrolling where none fires.
    let pause = 0
    let settle = 0
    // The browser marks the current letter as it draws a frame: read the mark once it has.
    const rest = () => {
      clearTimeout(pause)
      cancelAnimationFrame(settle)
      settle = requestAnimationFrame(() => {
        settle = requestAnimationFrame(() => follow(true))
      })
    }
    const onPage = () => {
      clearTimeout(pause)
      pause = window.setTimeout(rest, 150)
    }
    const resized = new ResizeObserver(onRow)
    // The arrow keys move between linked letters only: at the first link or the last the row
    // goes the whole way, so a blank letter beyond it comes into view as a swipe would show it.
    let reach = 0
    const onFocus = (event: FocusEvent) => {
      const links = row.querySelectorAll('a[href]')
      const end =
        event.target === links[0]
          ? 0
          : event.target === links[links.length - 1]
            ? row.scrollWidth
            : -1
      if (end < 0) return
      cancelAnimationFrame(reach)
      // After the browser has brought the letter itself into view.
      reach = requestAnimationFrame(() => row.scrollTo({ left: end, behavior: 'instant' }))
    }

    nav.addEventListener('scroll', onRow, { capture: true, passive: true })
    nav.addEventListener('focusin', onFocus)
    resized.observe(row)
    window.addEventListener('scrollend', rest)
    window.addEventListener('scroll', onPage, { passive: true })
    mark()
    // The browser marks the current letter as it draws a frame: the page may have opened at a
    // letter (an address with one), so read the mark once the next frame is drawn.
    let opening = requestAnimationFrame(() => {
      opening = requestAnimationFrame(() => follow(false))
    })

    return () => {
      nav.removeEventListener('scroll', onRow, { capture: true })
      nav.removeEventListener('focusin', onFocus)
      cancelAnimationFrame(reach)
      resized.disconnect()
      window.removeEventListener('scrollend', rest)
      window.removeEventListener('scroll', onPage)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(opening)
      cancelAnimationFrame(settle)
      clearTimeout(pause)
    }
  }, [list, rail])

  return band
}
