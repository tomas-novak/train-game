/**
 * A flat expanding disc drawn at the finger, created with direct DOM calls
 * inside the pointerdown handler itself. No React state, no timers: the
 * element and its animation exist before the pointer event finishes
 * dispatching, so the reaction lands on the very next composited frame even
 * when the tap hit nothing interactive at all.
 */

const LAYER_ID = 'tap-ripples'

function layer(): HTMLElement {
  const existing = document.getElementById(LAYER_ID)
  if (existing) return existing
  const el = document.createElement('div')
  el.id = LAYER_ID
  el.style.position = 'fixed'
  el.style.inset = '0'
  el.style.zIndex = '60'
  el.style.pointerEvents = 'none'
  el.style.overflow = 'hidden'
  document.body.appendChild(el)
  return el
}

export function showTapRipple(x: number, y: number, size = 120): void {
  const dot = document.createElement('div')
  dot.className = 'tap-ripple'
  dot.style.left = `${x - size / 2}px`
  dot.style.top = `${y - size / 2}px`
  dot.style.width = `${size}px`
  dot.style.height = `${size}px`
  dot.addEventListener('animationend', () => dot.remove())
  layer().appendChild(dot)
}
