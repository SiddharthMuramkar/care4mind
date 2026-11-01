'use client'

import { useEffect } from 'react'

const LOTUS = 'svg[data-lotus]'
// Smaller changes can't be seen, and skipping them spares a style recalculation.
const LEAST_CHANGE = 0.02

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

function write(svg: SVGSVGElement, name: '--lotus-near' | '--lotus-lean', value: number) {
  const now = Number(svg.style.getPropertyValue(name) || 0)
  if (Math.abs(value - now) >= LEAST_CHANGE || (value === 0 && now !== 0)) {
    svg.style.setProperty(name, value.toFixed(3))
  }
}

/** Lets the pointer move what nothing else moves: one listener set for every lotus on the site. */
function attach() {
  let frame = 0
  let pointer: { x: number; y: number } | null = null

  const lean = () => {
    frame = 0
    if (!pointer) return
    const { x, y } = pointer
    const svgs = [...document.querySelectorAll<SVGSVGElement>(LOTUS)]
    // Every rect is read before anything is written, so the frame lays out once.
    const placed = svgs.map((svg) => [svg, svg.getBoundingClientRect()] as const)
    for (const [svg, rect] of placed) {
      const reach = clamp(2 * rect.width, 120, 360)
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const near = smoothstep(1 - Math.hypot(x - cx, y - cy) / reach)
      write(svg, '--lotus-near', near)
      write(svg, '--lotus-lean', clamp((x - cx) / reach, -1, 1) * near)
    }
  }

  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
    pointer = { x: event.clientX, y: event.clientY }
    if (!frame) frame = requestAnimationFrame(lean)
  }

  const settle = () => {
    pointer = null
    for (const svg of document.querySelectorAll<SVGSVGElement>(LOTUS)) {
      write(svg, '--lotus-near', 0)
      write(svg, '--lotus-lean', 0)
    }
  }

  const bloom = (event: PointerEvent) => {
    const svg = event.target instanceof Element ? event.target.closest(LOTUS) : null
    if (!(svg instanceof SVGSVGElement)) return
    // The bloom runs from one of two identical animations; switching between them restarts it.
    svg.dataset.lotusBloom = svg.dataset.lotusBloom === 'a' ? 'b' : 'a'
  }

  document.addEventListener('pointermove', move, { passive: true })
  document.addEventListener('pointerdown', bloom, { passive: true })
  document.documentElement.addEventListener('pointerleave', settle, { passive: true })

  return () => {
    document.removeEventListener('pointermove', move)
    document.removeEventListener('pointerdown', bloom)
    document.documentElement.removeEventListener('pointerleave', settle)
    cancelAnimationFrame(frame)
    for (const svg of document.querySelectorAll<SVGSVGElement>(LOTUS)) {
      svg.style.removeProperty('--lotus-near')
      svg.style.removeProperty('--lotus-lean')
      delete svg.dataset.lotusBloom
    }
  }
}

/** Lotuses lean and open toward a mouse or pen and bloom when pressed, only while motion is allowed. */
export function LotusPointer() {
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: no-preference)')
    let detach: (() => void) | null = null
    const check = () => {
      if (query.matches && !detach) detach = attach()
      else if (!query.matches && detach) {
        detach()
        detach = null
      }
    }
    check()
    query.addEventListener('change', check)
    return () => {
      query.removeEventListener('change', check)
      detach?.()
    }
  }, [])

  return null
}
