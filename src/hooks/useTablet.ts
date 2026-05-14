import { useState, useEffect } from 'react'

export function useTablet() {
  const mq = window.matchMedia('(min-width: 768px)')
  const [on, setOn] = useState(() => mq.matches)
  useEffect(() => {
    const h = (e: MediaQueryListEvent) => setOn(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return on
}
