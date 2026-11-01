import type { Locator } from '@playwright/test'

import { contrastRatio } from '@/lib/contrast'

import { expect } from './fixtures'

/** A colour as 0–255 channels, whichever notation the browser computes it in. */
function channels(value: string) {
  const srgb = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/.exec(value)
  if (srgb) return srgb.slice(1, 4).map((part) => Math.round(Number(part) * 255))
  const rgb = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(value)
  if (rgb) return rgb.slice(1, 4).map(Number)
  const hex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(value.trim())
  return hex ? hex.slice(1, 4).map((part) => parseInt(part, 16)) : []
}

/**
 * Focus `control` from the keyboard's side and check its ring is drawn in paper's focus colour:
 * the page's turmeric ring all but vanishes on paper. `pseudo` names the part that draws the ring
 * when the control draws it on a stretched ::after.
 */
export async function expectPaperFocusRing(control: Locator, pseudo?: '::after') {
  await control.focus()
  await expect(control).toBeFocused()
  const ring = await control.evaluate((element, pseudo) => {
    const style = getComputedStyle(element, pseudo ?? null)
    return {
      visible: element.matches(':focus-visible'),
      width: style.outlineWidth,
      colour: style.outlineColor,
      paper: getComputedStyle(document.body).getPropertyValue('--color-surface-focus'),
    }
  }, pseudo)
  expect(ring.visible, 'focus is visible').toBe(true)
  expect(ring.width).not.toBe('0px')
  expect(channels(ring.colour)).toEqual(channels(ring.paper))
}

const hex = (value: string) =>
  `#${channels(value)
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('')}`

/**
 * Focus `control` and check its ring keeps 3:1 against what lies behind it (WCAG 1.4.11): the
 * box's own background when the ring is drawn inside it, else the first background around it.
 * `pseudo` names the stretched ::after that draws the ring over its positioned ancestor.
 */
export async function expectFocusRingContrast(control: Locator, pseudo?: '::after') {
  await control.focus()
  await expect(control).toBeFocused()
  const ring = await control.evaluate((element, pseudo) => {
    const style = getComputedStyle(element, pseudo ?? null)
    const box =
      pseudo && element instanceof HTMLElement ? (element.offsetParent ?? element) : element
    const inside = parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth) <= 0
    let behind: Element | null = inside ? box : box.parentElement
    while (behind) {
      const background = getComputedStyle(behind).backgroundColor
      if (!/^(transparent|rgba\(.*,\s*0\)|color\(srgb .* \/ 0\))$/.test(background)) break
      behind = behind.parentElement
    }
    return {
      visible: element.matches(':focus-visible'),
      width: style.outlineWidth,
      colour: style.outlineColor,
      behind: behind ? getComputedStyle(behind).backgroundColor : 'rgb(255, 255, 255)',
    }
  }, pseudo)
  expect(ring.visible, 'focus is visible').toBe(true)
  expect(ring.width).not.toBe('0px')
  expect(
    contrastRatio(hex(ring.colour), hex(ring.behind)),
    `${ring.colour} on ${ring.behind}`,
  ).toBeGreaterThanOrEqual(3)
}
