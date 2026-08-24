import type { FC } from 'react'
import { useTablet } from '../hooks/useTablet'

/**
 * "The round is over, let's do another one" — roadmap B1, and the reason it
 * exists is that the game used to decide the pace itself.
 *
 * Three rules it inherits and cannot break: no readable word on it (the child
 * cannot read), its own hue (green means the train is correct and nothing else),
 * and the same 88/72 px as `MuteButton`, which is well over the 64 px floor.
 *
 * It animates `transform` and `opacity` only, so the press is painted even
 * behind a busy main thread.
 */
export const NextButton: FC<{ onPress: () => void }> = ({ onPress }) => {
  const isTablet = useTablet()
  const size = isTablet ? 88 : 72
  const glyph = Math.round(size * 0.56)
  return (
    <button
      type="button"
      aria-label="Další"
      className="next-btn touch-none select-none"
      style={{ width: size, height: size }}
      onPointerDown={(e) => {
        e.preventDefault()
        onPress()
      }}
    >
      <svg width={glyph} height={glyph} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M8,5 L16,12 L8,19"
          fill="none"
          stroke="#fff"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
