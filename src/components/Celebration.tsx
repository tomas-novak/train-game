import type { FC } from 'react'
import { SKY } from '../theme'

const t = SKY

export const Celebration: FC = () => {
  const starCount = 16
  return (
    <div
      className="absolute inset-0 z-40 overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 40%, ${t.accent2}99, ${t.skyTop} 70%)`,
      }}
    >
      {/* falling stars */}
      {Array.from({ length: starCount }).map((_, i) => {
        const left = (i * 6.7 + (i % 3) * 4) % 96 + 2
        const delay = (i % 8) * 90
        const dur = 1600 + (i % 5) * 200
        const size = 16 + (i % 4) * 6
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${left}%`,
              top: '-12%',
              animation: `star-fall ${dur}ms cubic-bezier(.6,.05,.3,1) ${delay}ms forwards`,
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24">
              <polygon
                points="12,2 14.8,9 22,9.5 16.5,14 18.2,21 12,17 5.8,21 7.5,14 2,9.5 9.2,9"
                fill={i % 2 ? t.accent : t.accent2}
              />
            </svg>
          </div>
        )
      })}
      {/* hero star */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: 'hero-pop 700ms cubic-bezier(.3,1.6,.5,1) both' }}
      >
        <svg width="200" height="200" viewBox="0 0 24 24">
          <defs>
            <radialGradient id="hg-cel" cx="0.4" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#fff7d6" />
              <stop offset="0.6" stopColor={t.accent2} />
              <stop offset="1" stopColor={t.accent} />
            </radialGradient>
          </defs>
          <polygon
            points="12,2 14.8,9 22,9.5 16.5,14 18.2,21 12,17 5.8,21 7.5,14 2,9.5 9.2,9"
            fill="url(#hg-cel)"
            stroke={t.accent}
            strokeWidth="0.4"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
