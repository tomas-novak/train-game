import { useRef, type FC } from 'react'
import type { Task } from '../types'
import { CountRow } from './CountRow'
import { SKY } from '../theme'

const t = SKY

interface Props {
  task: Task
  onHelp: (() => void) | null
  pulse: boolean
  /** Read the task out loud. The panel is the child's "say it again" button. */
  onSpeak?: () => void
  isTablet?: boolean
}

export const TaskHero: FC<Props> = ({ task, onHelp, pulse, onSpeak, isTablet = false }) => {
  const CargoIcon = task.cargo.icon
  const panelRef = useRef<HTMLButtonElement>(null)

  const badgeSize  = isTablet ? 90 : 64
  const badgeFont  = isTablet ? 62 : 44
  const iconSize   = isTablet ? 78 : 56
  const helpSize   = isTablet ? 78 : 66 // never below the 64 px touch floor
  const helpFont   = isTablet ? 36 : 26
  /**
   * The dot under the numeral. Its twin on the track is 20 px at trackHeight 200,
   * and the two have to be the same size to the eye or the comparison they exist
   * for does not happen — so this one is 22, not the 24 it once was. The counter
   * cannot grow to meet it: two rows of pips have to fit in the bare strip above
   * the first rail without touching a wheel.
   */
  const dotSize    = isTablet ? 22 : 16

  /**
   * The task display is the one thing on screen that answers "what am I supposed
   * to do?", and the child cannot read the answer. So it is a button: press it
   * and the sentence is spoken again. The rock is started imperatively here so
   * its first frame is the frame of the touch — speech has real startup latency
   * and can never be the reaction to a finger.
   */
  const handlePanelPress = () => {
    const el = panelRef.current
    if (el) {
      el.classList.remove('task-poke')
      void el.offsetWidth
      el.classList.add('task-poke')
    }
    onSpeak?.()
  }

  return (
    <div className="flex items-center gap-3">
      <button
        ref={panelRef}
        type="button"
        data-touchable
        onPointerDown={handlePanelPress}
        onAnimationEnd={() => panelRef.current?.classList.remove('task-poke')}
        aria-label="Zadání"
        className={`flex items-center gap-3 rounded-3xl pl-4 pr-5 py-3 touch-none select-none transition-transform duration-150 ${pulse ? 'scale-105' : 'scale-100'}`}
        style={{
          background: t.panel,
          boxShadow: `0 8px 20px ${t.shadow}, inset 0 -3px 0 ${t.panelEdge}`,
        }}
      >
        {/* The numeral and its quantity, stacked: one column, read top to bottom. */}
        <div className="flex flex-col items-start" style={{ gap: isTablet ? 10 : 7 }}>
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
          <CountRow total={task.count} filled={task.count} dot={dotSize} variant="target" />
        </div>
        <CargoIcon size={iconSize} />
      </button>
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
