import { useEffect } from 'react'

/**
 * Keeps the tablet's screen awake while the game is open.
 *
 * Every failure here is silent by design. The lock is a nicety — a screen that
 * sleeps mid-round is an annoyance, not a broken game — so an unsupported
 * browser, a refused request and a revoked sentinel all end the same way: the
 * game carries on and says nothing.
 *
 * The browser releases the lock whenever the page stops being visible, and it
 * does not hand it back on its own, so it is re-acquired on `visibilitychange`.
 */
export function useWakeLock() {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      if (document.visibilityState !== 'visible' || sentinel !== null) return
      try {
        const held = await navigator.wakeLock.request('screen')
        if (cancelled) {
          void held.release().catch(() => {})
          return
        }
        sentinel = held
        held.addEventListener('release', () => {
          if (sentinel === held) sentinel = null
        })
      } catch {
        sentinel = null
      }
    }

    void acquire()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      if (sentinel !== null) {
        void sentinel.release().catch(() => {})
        sentinel = null
      }
    }
  }, [])
}
