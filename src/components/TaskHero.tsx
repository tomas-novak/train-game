import type { FC } from 'react'
import type { Task } from '../types'
import { SKY } from '../theme'

const t = SKY

interface Props {
  task: Task
  onHelp: (() => void) | null
  pulse: boolean
  isTablet?: boolean
}

export const TaskHero: FC<Props> = ({ task, onHelp, pulse, isTablet = false }) => {
  const CargoIcon = task.cargo.icon

  const badgeSize  = isTablet ? 90 : 64
  const badgeFont  = isTablet ? 62 : 44
  const iconSize   = isTablet ? 78 : 56
  const helpSize   = isTablet ? 78 : 56
  const helpFont   = isTablet ? 36 : 26

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center gap-3 rounded-3xl pl-4 pr-5 py-3 transition-transform duration-150 ${pulse ? 'scale-105' : 'scale-100'}`}
        style={{
          background: t.panel,
          boxShadow: `0 8px 20px ${t.shadow}, inset 0 -3px 0 ${t.panelEdge}`,
        }}
      >
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{
            width: badgeSize, height: badgeSize,
            background: `linear-gradient(180deg, ${t.accent2}, ${t.accent})`,
            boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.4)`,
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 900,
            fontSize: badgeFont,
            lineHeight: 1,
          }}
        >
          {task.count}
        </div>
        <CargoIcon size={iconSize} />
      </div>
      {onHelp && (
        <button
          onClick={onHelp}
          className="rounded-full transition-transform active:scale-90 hover:scale-105 flex items-center justify-center"
          style={{
            width: helpSize, height: helpSize,
            background: t.panel,
            color: t.inkSoft,
            fontWeight: 800, fontSize: helpFont, lineHeight: 1,
            boxShadow: `0 6px 14px ${t.softShadow}, inset 0 -2px 0 ${t.panelEdge}`,
          }}
          aria-label="Help"
        >
          ?
        </button>
      )}
    </div>
  )
}
