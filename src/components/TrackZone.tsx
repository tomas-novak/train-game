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
  isBlocked: boolean
  validation: ValidationResult | null
  phase: GamePhase
}

export const TrackZone = forwardRef<HTMLDivElement, Props>(
  ({ trainItems, onRemoveItem, isOver, isBlocked, validation, phase }, ref) => {
    const isWrong = phase === 'wrong'

    // Only highlight wagon type errors on the wagons themselves.
    // Count errors are shown as a separate indicator so the child
    // isn't confused into thinking the wagon type is wrong.
    function itemError(item: KeyedTrainItem): boolean {
      if (!isWrong || !validation) return false
      if (item.kind === 'loco') return !validation.locomotiveOk
      return !validation.wagonTypeOk
    }

    const hasNoWagons = trainItems.filter((t) => t.kind === 'wagon').length === 0
    // Show ❌ when count is wrong AND the type is right (or no wagons at all,
    // where wagonTypeOk is spuriously false because selectedWagonType is null).
    const showCountError =
      isWrong &&
      validation !== null &&
      !validation.wagonCountOk &&
      (validation.wagonTypeOk || hasNoWagons)

    const activeOver = isOver && !isBlocked
    const blockedOver = isOver && isBlocked

    return (
      <div
        ref={ref}
        className={[
          'relative w-full transition-all duration-200 overflow-hidden',
          activeOver ? 'ring-4 ring-yellow-400 ring-inset' : '',
          blockedOver ? 'ring-4 ring-red-500 ring-inset' : '',
        ].join(' ')}
        style={{
          height: '120px',
          backgroundColor: activeOver ? '#fef08a' : blockedOver ? '#fca5a5' : '#57534e',
          backgroundImage: isOver
            ? undefined
            : 'repeating-linear-gradient(90deg, transparent 0px, transparent 38px, #44403c 38px, #44403c 46px)',
        }}
      >
        {/* Rails */}
        <div className="absolute inset-x-0 top-6 h-3 bg-stone-900 shadow" />
        <div className="absolute inset-x-0 bottom-6 h-3 bg-stone-900 shadow" />

        {/* Traffic light at ~10% from left edge */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
          style={{ left: '10%', transform: 'translateX(-50%)', zIndex: 10 }}
        >
          {/* Signal housing */}
          <div
            style={{
              background: '#1a1a1a',
              borderRadius: 6,
              padding: '4px 3px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              marginTop: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            {/* Red – active */}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#ff2222',
                boxShadow: '0 0 10px 5px rgba(255,40,40,0.75)',
              }}
            />
            {/* Orange – off */}
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#2c2c2c' }} />
            {/* Green – off */}
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#2c2c2c' }} />
          </div>
          {/* Pole */}
          <div style={{ flex: 1, width: 4, background: '#666', borderRadius: 2 }} />
        </div>

        {/* Scrollable train row – starts after traffic light */}
        <div
          className="absolute inset-0 flex items-center gap-1 overflow-x-auto overflow-y-hidden"
          style={{ paddingLeft: 'calc(10% + 28px)', paddingRight: '16px' }}
        >
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
        {activeOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-yellow-600 opacity-60 select-none">⬇️</span>
          </div>
        )}
        {blockedOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl select-none">🚫</span>
          </div>
        )}
      </div>
    )
  },
)

TrackZone.displayName = 'TrackZone'
