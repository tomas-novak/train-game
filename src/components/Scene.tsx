import type { FC, ReactNode } from 'react'
import { SKY } from '../theme'

const t = SKY

const Cloud: FC<{ top: string; left: string; scale?: number }> = ({ top, left, scale = 1 }) => (
  <div
    className="absolute pointer-events-none"
    style={{ top, left, transform: `scale(${scale})`, opacity: 0.85 }}
  >
    <svg width="80" height="32" viewBox="0 0 80 32">
      <ellipse cx="20" cy="20" rx="18" ry="11" fill={t.cloud} />
      <ellipse cx="42" cy="16" rx="22" ry="14" fill={t.cloud} />
      <ellipse cx="62" cy="22" rx="16" ry="9" fill={t.cloud} />
    </svg>
  </div>
)

export const Scene: FC<{ children: ReactNode; trackHeight?: number }> = ({ children, trackHeight = 140 }) => (
  <div
    className="relative w-full h-full overflow-hidden"
    style={{ background: `linear-gradient(180deg, ${t.skyTop} 0%, ${t.skyBot} 100%)` }}
  >
    {/* sun */}
    <div
      className="absolute"
      style={{
        top: '7%', right: '8%',
        width: 64, height: 64, borderRadius: 999,
        background: `radial-gradient(circle at 35% 35%, ${t.sun}, ${t.sun} 50%, transparent 75%)`,
        filter: 'blur(0.5px)',
      }}
    />
    <Cloud top="14%" left="6%" scale={1} />
    <Cloud top="22%" left="62%" scale={0.7} />
    <Cloud top="34%" left="30%" scale={0.55} />
    {/* hills – bottom offset keeps them visible above the track+submit stack; formula calibrated for 140 and 200 */}
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
      className="absolute inset-x-0"
      style={{ bottom: trackHeight - 10, height: 120 }}
    >
      <path d="M0,160 Q60,80 130,110 Q220,150 290,90 Q360,40 400,80 L400,200 L0,200 Z" fill={t.hillBack} />
      <path d="M0,180 Q80,120 160,150 Q260,180 340,130 Q380,110 400,130 L400,200 L0,200 Z" fill={t.hillFront} />
    </svg>
    {children}
  </div>
)
