import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function CelebrationScreen() {
  useEffect(() => {
    const end = Date.now() + 2000
    let rafId: number

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'],
      })
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'],
      })
      if (Date.now() < end) {
        rafId = requestAnimationFrame(frame)
      }
    }
    frame()
    return () => {
      cancelAnimationFrame(rafId)
      confetti.reset()
    }
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-yellow-100 z-50 gap-6">
      <div className="text-center celebration-bounce">
        <div className="text-9xl">⭐</div>
      </div>
      <div className="flex gap-4 text-7xl celebration-spin">
        <span>🎉</span>
        <span>🚂</span>
        <span>🎊</span>
      </div>
      <div className="flex gap-3 text-6xl">
        <span className="celebration-pop" style={{ animationDelay: '0ms' }}>✨</span>
        <span className="celebration-pop" style={{ animationDelay: '150ms' }}>⭐</span>
        <span className="celebration-pop" style={{ animationDelay: '300ms' }}>✨</span>
        <span className="celebration-pop" style={{ animationDelay: '450ms' }}>⭐</span>
        <span className="celebration-pop" style={{ animationDelay: '600ms' }}>✨</span>
      </div>
    </div>
  )
}
