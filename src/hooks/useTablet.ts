import { useState, useEffect } from 'react'

export function useTablet() {
  const [on, setOn] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const h = (e: MediaQueryListEvent) => setOn(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return on
}
