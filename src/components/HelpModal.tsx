import { useEffect, type FC } from 'react'
import type { Task } from '../types'
import { WAGONS } from '../data/wagons'
import { CARGO } from '../data/cargo'
import { SKY } from '../theme'

const t = SKY

const WAGON_GROUPS = WAGONS.map((wagon) => ({
  wagon,
  list: CARGO.filter((c) => c.wagonType === wagon.type),
})).filter((g) => g.list.length > 0)

interface Props {
  open: boolean
  onClose: () => void
  task: Task
}

export const HelpModal: FC<Props> = ({ open, onClose, task }) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(20,20,30,0.55)' }}
      onClick={onClose}
    >
      <div
        className="rounded-3xl p-4 flex flex-col gap-2 mx-3 relative overflow-y-auto"
        style={{
          background: t.panel,
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          maxHeight: '88%',
          width: 320,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pr-1 pl-2">
          <div className="flex gap-1 items-center">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <polygon points="12,2 14.8,9 22,9.5 16.5,14 18.2,21 12,17 5.8,21 7.5,14 2,9.5 9.2,9" fill={t.accent2} />
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <polygon points="12,2 14.8,9 22,9.5 16.5,14 18.2,21 12,17 5.8,21 7.5,14 2,9.5 9.2,9" fill={t.accent2} />
            </svg>
          </div>
          <button
            onClick={onClose}
            className="rounded-full transition-transform active:scale-90 flex items-center justify-center"
            style={{ width: 48, height: 48, background: t.panelEdge, color: t.ink, fontWeight: 900, fontSize: 22, lineHeight: 1 }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {WAGON_GROUPS.map(({ wagon, list }) => {
            const WagonIcon = wagon.icon
            return (
              <div
                key={wagon.type}
                className="flex items-center gap-2 rounded-2xl px-2 py-1"
                style={{ background: t.panelEdge + '55' }}
              >
                <div className="flex items-center gap-0.5 flex-wrap">
                  {list.map((c) => {
                    const Icon = c.icon
                    const isActive = c.id === task.cargo.id
                    return (
                      <div
                        key={c.id}
                        className="rounded-xl p-0.5"
                        style={isActive ? { background: t.accent2 + '55', boxShadow: `inset 0 0 0 2px ${t.accent}` } : undefined}
                      >
                        <Icon size={36} />
                      </div>
                    )
                  })}
                </div>
                <svg width="22" height="14" viewBox="0 0 22 14">
                  <path d="M2,7 L18,7 M14,3 L18,7 L14,11" stroke={t.inkSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <WagonIcon size={62} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
