import { useRef, useEffect, useState, useCallback } from 'react'
import { useGameState } from './hooks/useGameState'
import { CORRECT_PER_LEVEL } from './data/levels'
import { TaskHero } from './components/TaskHero'
import { HelpModal } from './components/HelpModal'
import { DragPalette } from './components/DragPalette'
import { TrackZone } from './components/TrackZone'
import { Celebration } from './components/Celebration'
import { Scene } from './components/Scene'
import { SKY } from './theme'
import { darken } from './utils/color'
import type { TrainItem, TrainIcon } from './types'
import type { DragStartPayload } from './components/DragPalette'
import type { FC } from 'react'

const t = SKY
const RESET_FLASH_MS = 400

interface ActiveDrag {
  item: TrainItem
  Icon: FC<TrainIcon>
  iconSize: number
  x: number
  y: number
}


export default function App() {
  const game = useGameState()
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef<ActiveDrag | null>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current) }
  }, [])

  const [dragging, setDragging] = useState<ActiveDrag | null>(null)
  const [isOverTrack, setIsOverTrack] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const { addToTrain, removeFromTrain, submit, resetProgress, shakeKey, pulseTask } = game

  const checkOverTrack = useCallback((x: number, y: number): boolean => {
    if (!trackRef.current) return false
    const rect = trackRef.current.getBoundingClientRect()
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }, [])

  useEffect(() => {
    draggingRef.current = dragging
  }, [dragging])

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      setDragging((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : null))
      setIsOverTrack(checkOverTrack(e.clientX, e.clientY))
    }
    const handleUp = (e: PointerEvent) => {
      const d = draggingRef.current
      if (!d) return
      if (checkOverTrack(e.clientX, e.clientY)) addToTrain(d.item)
      draggingRef.current = null
      setDragging(null)
      setIsOverTrack(false)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [checkOverTrack, addToTrain])

  // Trigger shake animation when shakeKey increments
  useEffect(() => {
    if (shakeKey > 0 && containerRef.current) {
      containerRef.current.classList.remove('shake')
      void containerRef.current.offsetWidth
      containerRef.current.classList.add('shake')
    }
  }, [shakeKey])

  const handleDragStart = useCallback(
    (payload: DragStartPayload, e: React.PointerEvent) => {
      const newDrag: ActiveDrag = {
        item: payload.item,
        Icon: payload.Icon,
        iconSize: payload.iconSize,
        x: e.clientX,
        y: e.clientY,
      }
      draggingRef.current = newDrag
      setDragging(newDrag)
    },
    [],
  )

  const handleReset = useCallback(() => {
    resetProgress()
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current)
    setResetting(true)
    resetTimerRef.current = setTimeout(() => setResetting(false), RESET_FLASH_MS)
  }, [resetProgress])

  return (
    <div className="min-h-svh flex items-stretch">
      <Scene>
        <div
          ref={containerRef}
          className="relative w-full h-full flex flex-col select-none"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: t.ink, minHeight: '100svh' }}
        >
          {/* top bar */}
          <div className="flex items-start justify-between px-3 pt-3 gap-2">
            <TaskHero
              task={game.task}
              onHelp={() => setHelpOpen(true)}
              pulse={pulseTask}
            />
            <button onClick={handleReset} className="pt-1" title="Reset progress" aria-label="Reset progress">
              <div className="flex flex-col items-end gap-2">
                {/* stars */}
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <svg key={i} width="22" height="22" viewBox="0 0 24 24">
                      <polygon
                        points="12,2 14.8,9 22,9.5 16.5,14 18.2,21 12,17 5.8,21 7.5,14 2,9.5 9.2,9"
                        fill={i <= game.progress.level ? t.accent2 : t.panelEdge}
                        stroke={i <= game.progress.level ? t.accent : 'transparent'}
                        strokeWidth="0.6"
                      />
                    </svg>
                  ))}
                </div>
                {/* progress dots */}
                <div className="flex gap-1.5">
                  {Array.from({ length: CORRECT_PER_LEVEL }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all"
                      style={{
                        width: i < game.progress.correctInLevel ? 16 : 12,
                        height: i < game.progress.correctInLevel ? 16 : 12,
                        background: i < game.progress.correctInLevel ? t.good : t.panelEdge,
                        boxShadow: i < game.progress.correctInLevel
                          ? `inset 0 -2px 0 rgba(0,0,0,0.15), 0 2px 4px ${t.softShadow}`
                          : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </button>
          </div>

          {/* palette */}
          <div className="flex-1 flex items-center justify-center px-3">
            <DragPalette trainItems={game.trainItems} onDragStart={handleDragStart} />
          </div>

          {/* drag hint */}
          {game.trainItems.length === 0 && (
            <div className="flex justify-center pb-1 pointer-events-none select-none">
              <svg width="38" height="44" viewBox="0 0 38 44" className="animate-bounce">
                <path
                  d="M19,4 L19,30 M19,30 L7,18 M19,30 L31,18"
                  stroke={t.ink}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.55}
                />
              </svg>
            </div>
          )}

          {/* track */}
          <TrackZone
            ref={trackRef}
            trainItems={game.trainItems}
            onRemoveItem={removeFromTrain}
            isOver={isOverTrack}
            isBlocked={(() => {
              if (!isOverTrack || dragging?.item.kind !== 'wagon') return false
              if (!game.atCap) return false
              const placedWagonType = game.trainItems.find((p) => p.kind === 'wagon')?.type ?? null
              return dragging.item.type === placedWagonType
            })()}
            validation={game.validation}
            phase={game.phase}
          />

          {/* submit */}
          <div className="flex justify-center py-4" style={{ background: t.skyBot }}>
            <button
              onClick={submit}
              disabled={game.phase === 'departing'}
              className="rounded-full transition-all active:scale-95 hover:-translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-3 px-8 py-4"
              style={{
                background: `linear-gradient(180deg, ${t.good}, ${darken(t.good)})`,
                color: '#fff',
                fontWeight: 900,
                fontSize: 28,
                lineHeight: 1,
                boxShadow: `0 10px 22px ${t.shadow}, inset 0 -4px 0 rgba(0,0,0,0.18), inset 0 2px 0 rgba(255,255,255,0.4)`,
                minHeight: 64,
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24">
                <polygon points="6,4 20,12 6,20" fill="#fff" />
              </svg>
              <span>Jet!</span>
            </button>
          </div>

          {/* drag ghost */}
          {dragging && (
            <div
              className="fixed pointer-events-none z-50"
              style={{
                left: dragging.x,
                top: dragging.y,
                transform: 'translate(-50%, -50%) scale(1.18) rotate(-5deg)',
                filter: `drop-shadow(0 12px 16px ${t.shadow})`,
              }}
            >
              <dragging.Icon size={dragging.iconSize} />
            </div>
          )}

          {/* help modal */}
          <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} task={game.task} />

          {/* celebration overlay */}
          {game.phase === 'celebrating' && <Celebration />}

          {/* reset flash */}
          {resetting && (
            <div
              className="absolute inset-0 z-50 pointer-events-none"
              style={{ background: '#fff', animation: 'flash 400ms ease-out' }}
            />
          )}
        </div>
      </Scene>
    </div>
  )
}
