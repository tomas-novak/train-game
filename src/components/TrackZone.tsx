import { forwardRef } from 'react'
import type { KeyedTrainItem, ValidationResult } from '../types'
import { LOCOMOTIVES } from '../data/locomotives'
import { WAGONS } from '../data/wagons'
import type { GamePhase } from '../hooks/useGameState'

const LOCO_EMOJI = Object.fromEntries(LOCOMOTIVES.map((l) => [l.id, l.emoji]))
const WAGON_EMOJI = Object.fromEntries(WAGONS.map((w) => [w.type, w.emoji]))

interface Props {
  trainItems: KeyedTrainItem[]
  onRemoveItem: (key: number) => void
  isOver: boolean
  validation: ValidationResult | null
  phase: GamePhase
}

export const TrackZone = forwardRef<HTMLDivElement, Props>(
  ({ trainItems, onRemoveItem, isOver, validation, phase }, ref) => {
    const isWrong = phase === 'wrong'

    // Only highlight wagon type errors on the wagons themselves.
    // Count errors are shown as a separate indicator so the child
    // isn't confused into thinking the wagon type is wrong.
    function itemError(item: KeyedTrainItem): boolean {
      if (!isWrong || !validation) return false
      if (item.kind === 'loco') return !validation.locomotiveOk
      return !validation.wagonTypeOk
    }

    const showCountError =
      isWrong && validation !== null && validation.wagonTypeOk && !validation.wagonCountOk

    return (
      <div
        ref={ref}
        className={[
          'relative w-full transition-all duration-200 overflow-hidden',
          isOver ? 'ring-4 ring-yellow-400 ring-inset' : '',
        ].join(' ')}
        style={{
          height: '120px',
          backgroundColor: isOver ? '#fef08a' : '#57534e',
          backgroundImage: isOver
            ? undefined
            : 'repeating-linear-gradient(90deg, transparent 0px, transparent 38px, #44403c 38px, #44403c 46px)',
        }}
      >
        {/* Rails */}
        <div className="absolute inset-x-0 top-6 h-3 bg-stone-900 shadow" />
        <div className="absolute inset-x-0 bottom-6 h-3 bg-stone-900 shadow" />

        {/* Scrollable train row */}
        <div className="absolute inset-0 flex items-center gap-1 px-4 overflow-x-auto overflow-y-hidden">
          {trainItems.length === 0 ? (
            <div className="flex gap-2 opacity-20 select-none pointer-events-none">
              <span className="text-5xl">🚂</span>
              <span className="text-4xl">🟫</span>
              <span className="text-4xl">🟫</span>
              <span className="text-4xl">🟫</span>
            </div>
          ) : (
            <>
              {trainItems.map((item) => {
                const emoji =
                  item.kind === 'loco' ? LOCO_EMOJI[item.id] : WAGON_EMOJI[item.type]
                const hasError = itemError(item)
                return (
                  <button
                    key={item._key}
                    onClick={() => onRemoveItem(item._key)}
                    className={[
                      'shrink-0 rounded-xl p-1 transition-all duration-150 touch-none select-none',
                      'active:scale-90 cursor-pointer',
                      hasError
                        ? 'bg-red-400/80 animate-bounce'
                        : 'hover:bg-white/20 active:bg-white/30',
                      item.kind === 'loco' ? 'text-5xl' : 'text-4xl',
                    ].join(' ')}
                  >
                    {emoji}
                  </button>
                )
              })}
              {/* Count error: show a pulsing ❌ after the wagons */}
              {showCountError && (
                <span className="shrink-0 text-3xl animate-bounce select-none pointer-events-none">
                  ❌
                </span>
              )}
            </>
          )}
        </div>

        {/* Drop hint when dragging over */}
        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-yellow-600 opacity-60 select-none">
              ⬇️
            </span>
          </div>
        )}
      </div>
    )
  },
)

TrackZone.displayName = 'TrackZone'
