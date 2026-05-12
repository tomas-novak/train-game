import { forwardRef, type FC } from 'react'
import type { KeyedTrainItem, ValidationResult } from '../types'
import { LOCOMOTIVES } from '../data/locomotives'
import { WAGONS } from '../data/wagons'
import type { GamePhase } from '../hooks/useGameState'
import { SKY } from '../theme'

const t = SKY

const LOCO_ICON = Object.fromEntries(LOCOMOTIVES.map((l) => [l.id, l.icon]))
const WAGON_ICON = Object.fromEntries(WAGONS.map((w) => [w.type, w.icon]))

const Signal: FC<{ isGo: boolean }> = ({ isGo }) => (
  <div className="absolute pointer-events-none" style={{ left: 14, top: -2, bottom: 0 }}>
    <div
      className="rounded-xl flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #3a3a3a, #1a1a1a)',
        width: 32, height: 76, padding: 5, gap: 4, marginTop: 6,
        boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 -2px 0 rgba(0,0,0,0.6)',
      }}
    >
      <div
        className={isGo ? undefined : 'animate-pulse'}
        style={{
          width: 18, height: 18, borderRadius: '50%',
          background: isGo
            ? 'radial-gradient(circle at 35% 30%, #555, #2a2a2a)'
            : `radial-gradient(circle at 35% 30%, #ff8a8a, ${t.bad})`,
          boxShadow: isGo ? 'none' : `0 0 12px 4px ${t.bad}aa`,
        }}
      />
      <div
        style={{
          width: 18, height: 18, borderRadius: '50%',
          background: isGo
            ? `radial-gradient(circle at 35% 30%, #b8e5b8, ${t.good})`
            : 'radial-gradient(circle at 35% 30%, #555, #2a2a2a)',
          boxShadow: isGo ? `0 0 12px 4px ${t.good}aa` : 'none',
        }}
      />
    </div>
    <div style={{ flex: 1, width: 4, background: '#666', borderRadius: 2, margin: '0 auto' }} />
  </div>
)

const PlaceholderLoco = LOCOMOTIVES[0].icon
const PlaceholderWagon = WAGONS[0].icon

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
    const isDeparting = phase === 'departing'

    function itemError(item: KeyedTrainItem): boolean {
      if (!isWrong || !validation) return false
      if (item.kind === 'loco') return !validation.locomotiveOk
      return !validation.wagonTypeOk
    }

    const hasNoWagons = trainItems.filter((item) => item.kind === 'wagon').length === 0
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
        className="relative w-full transition-colors duration-200"
        style={{
          height: 140,
          background: activeOver
            ? `linear-gradient(180deg, ${t.accent2}33, ${t.accent}55)`
            : t.ground,
          boxShadow: activeOver
            ? `inset 0 0 0 4px ${t.accent}`
            : blockedOver
              ? `inset 0 0 0 4px ${t.bad}`
              : 'inset 0 1px 0 rgba(0,0,0,0.08), inset 0 -1px 0 rgba(0,0,0,0.08)',
        }}
      >
        {/* sleepers */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 400 140"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x={i * 36} y={56} width={28} height={28} rx={3}
              fill={i % 2 === 0 ? t.tie : t.tieDark}
              opacity={activeOver ? 0.4 : 0.9}
            />
          ))}
        </svg>

        {/* rails */}
        <div
          className="absolute inset-x-0"
          style={{
            top: 52, height: 6,
            background: `linear-gradient(180deg, ${t.railHi}, ${t.rail})`,
            boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
          }}
        />
        <div
          className="absolute inset-x-0"
          style={{
            bottom: 52, height: 6,
            background: `linear-gradient(180deg, ${t.railHi}, ${t.rail})`,
            boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
          }}
        />

        <Signal isGo={isDeparting} />

        {/* train row */}
        <div
          className={`absolute inset-0 flex items-center gap-0 overflow-y-hidden ${
            isDeparting ? 'overflow-x-hidden train-depart' : 'overflow-x-auto'
          }`}
          style={{ paddingLeft: 64, paddingRight: 16 }}
        >
          {trainItems.length === 0 ? (
            <div className="flex gap-1 opacity-30 select-none pointer-events-none items-center">
              <PlaceholderLoco size={88} />
              <PlaceholderWagon size={72} />
              <PlaceholderWagon size={72} />
            </div>
          ) : (
            <>
              {trainItems.map((item) => {
                const Icon = item.kind === 'loco' ? LOCO_ICON[item.id] : WAGON_ICON[item.type]
                const hasError = itemError(item)
                return (
                  <button
                    key={item._key}
                    onClick={() => onRemoveItem(item._key)}
                    className={`shrink-0 rounded-2xl p-1 transition-all duration-150 touch-none select-none active:scale-90 cursor-pointer flex items-center justify-center ${
                      hasError ? 'animate-bounce' : 'hover:bg-white/15'
                    }`}
                    style={hasError ? { background: `${t.bad}72` } : undefined}
                  >
                    <Icon size={item.kind === 'loco' ? 92 : 78} />
                  </button>
                )
              })}
              {showCountError && (
                <div
                  className="shrink-0 ml-1 flex items-center justify-center animate-bounce select-none pointer-events-none rounded-full"
                  style={{ width: 44, height: 44, background: t.bad, color: '#fff', fontSize: 28, fontWeight: 900 }}
                >
                  ✕
                </div>
              )}
            </>
          )}
        </div>

        {/* drop hints */}
        {activeOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="rounded-full px-4 py-2"
              style={{ background: t.accent, color: '#fff', fontWeight: 800 }}
            >
              ⬇
            </div>
          </div>
        )}
        {blockedOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="rounded-full w-12 h-12 flex items-center justify-center"
              style={{ background: '#fff', color: t.bad, fontSize: 28, fontWeight: 900 }}
            >
              ✕
            </div>
          </div>
        )}
      </div>
    )
  },
)

TrackZone.displayName = 'TrackZone'
