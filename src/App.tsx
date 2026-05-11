import { useRef, useEffect, useState, useCallback } from 'react'
import { useGameState } from './hooks/useGameState'
import { CORRECT_PER_LEVEL } from './data/levels'
import { TaskDisplay } from './components/TaskDisplay'
import { DragPalette } from './components/DragPalette'
import { TrackZone } from './components/TrackZone'
import { CelebrationScreen } from './components/CelebrationScreen'
import type { TrainItem } from './types'
import type { DragStartPayload } from './components/DragPalette'

interface ActiveDrag {
  item: TrainItem
  emoji: string
  x: number
  y: number
}

export default function App() {
  const game = useGameState()
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef<ActiveDrag | null>(null)

  const [dragging, setDragging] = useState<ActiveDrag | null>(null)
  const [isOverTrack, setIsOverTrack] = useState(false)

  const { addToTrain, removeFromTrain, submit } = game

  const checkOverTrack = useCallback((x: number, y: number): boolean => {
    if (!trackRef.current) return false
    const rect = trackRef.current.getBoundingClientRect()
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }, [])

  // Keep ref in sync so event handlers always see latest value
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
      if (checkOverTrack(e.clientX, e.clientY)) {
        addToTrain(d.item)
      }
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

  const handleDragStart = useCallback(
    (payload: DragStartPayload, e: React.PointerEvent) => {
      const newDrag: ActiveDrag = {
        item: payload.item,
        emoji: payload.emoji,
        x: e.clientX,
        y: e.clientY,
      }
      draggingRef.current = newDrag
      setDragging(newDrag)
    },
    [],
  )

  // Shake animation on wrong answer
  useEffect(() => {
    if (game.phase === 'wrong' && containerRef.current) {
      containerRef.current.classList.remove('shake')
      void containerRef.current.offsetWidth
      containerRef.current.classList.add('shake')
    }
  }, [game.phase])

  if (game.phase === 'celebrating') {
    return <CelebrationScreen />
  }

  return (
    <div
      ref={containerRef}
      className="min-h-svh bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-100 flex flex-col select-none"
    >
      {/* Top bar: task left, level+progress right */}
      <div className="flex items-start justify-between p-3 gap-2">
        <TaskDisplay task={game.task} />
        <div className="flex flex-col items-end gap-2 pt-1 shrink-0">
          <div className="text-xl leading-none">{'⭐'.repeat(game.progress.level)}</div>
          <div className="flex gap-2">
            {Array.from({ length: CORRECT_PER_LEVEL }).map((_, i) => (
              <div
                key={i}
                className={[
                  'w-4 h-4 rounded-full transition-all',
                  i < game.progress.correctInLevel
                    ? 'bg-green-500 scale-125'
                    : 'bg-gray-400/60',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Palette – center of screen */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <DragPalette trainItems={game.trainItems} onDragStart={handleDragStart} />
      </div>

      {/* Track drop zone – full width */}
      <TrackZone
        ref={trackRef}
        trainItems={game.trainItems}
        onRemoveItem={removeFromTrain}
        isOver={isOverTrack}
        isBlocked={isOverTrack && game.atCap && dragging?.item.kind === 'wagon'}
        validation={game.validation}
        phase={game.phase}
      />

      {/* Submit button */}
      <div className="flex justify-center py-4 bg-emerald-100">
        <button
          onClick={submit}
          className="text-4xl font-black rounded-3xl px-10 py-4 bg-orange-400 text-white shadow-xl active:scale-95 hover:bg-orange-500 transition-all min-w-[180px]"
        >
          🚂 Jet!
        </button>
      </div>

      {/* Drag ghost – follows pointer */}
      {dragging && (
        <div
          className="fixed pointer-events-none z-50 text-6xl"
          style={{
            left: dragging.x - 36,
            top: dragging.y - 36,
            transform: 'scale(1.25) rotate(-5deg)',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
          }}
        >
          {dragging.emoji}
        </div>
      )}
    </div>
  )
}
