import { forwardRef, type FC } from 'react'
import type { KeyedTrainItem, ValidationResult } from '../types'
import { LOCOMOTIVES } from '../data/locomotives'
import { WAGONS } from '../data/wagons'
import type { GamePhase } from '../hooks/useGameState'
import { SKY } from '../theme'

const t = SKY

const LOCO_ICON = Object.fromEntries(LOCOMOTIVES.map((l) => [l.id, l.icon]))
const WAGON_ICON = Object.fromEntries(WAGONS.map((w) => [w.type, w.icon]))

const Signal: FC<{ isGo: boolean; trackHeight: number }> = ({ isGo, trackHeight }) => {
  const lampH  = Math.round(trackHeight * 0.543)
  const lampW  = Math.round(trackHeight * 0.229)
  const lightD = Math.round(trackHeight * 0.129)
  const left   = Math.round(trackHeight * 0.1)

  return (
    <div className="absolute pointer-events-none flex flex-col" style={{ left, top: -2, height: trackHeight + 2 }}>
      <div
        className="rounded-xl flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #3a3a3a, #1a1a1a)',
          width: lampW, height: lampH, padding: 5, gap: 4, marginTop: 6,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 -2px 0 rgba(0,0,0,0.6)',
        }}
      >
        <div
          className={isGo ? undefined : 'animate-pulse'}
          style={{
            width: lightD, height: lightD, borderRadius: '50%',
            background: isGo
              ? 'radial-gradient(circle at 35% 30%, #555, #2a2a2a)'
              : `radial-gradient(circle at 35% 30%, #ff8a8a, ${t.bad})`,
            boxShadow: isGo ? 'none' : `0 0 12px 4px ${t.bad}aa`,
          }}
        />
        <div
          style={{
            width: lightD, height: lightD, borderRadius: '50%',
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
}

const PlaceholderLoco = LOCOMOTIVES[0].icon
const PlaceholderWagon = WAGONS[0].icon

interface Props {
  trainItems: KeyedTrainItem[]
  onRemoveItem: (key: number) => void
  isOver: boolean
  isBlocked: boolean
  validation: ValidationResult | null
  phase: GamePhase
  trackHeight?: number
}

export const TrackZone = forwardRef<HTMLDivElement, Props>(
  ({ trainItems, onRemoveItem, isOver, isBlocked, validation, phase, trackHeight = 140 }, ref) => {
    const isWrong = phase === 'wrong'
    const isDeparting = phase === 'departing'

    const railOff = Math.round(trackHeight * 0.371)
    const slpY    = railOff + 4
    const slpH    = trackHeight - railOff * 2 - 8
    const padL    = Math.round(trackHeight * 0.457)
    const locoSz  = Math.round(trackHeight * 0.657)
    const wagonSz = Math.round(trackHeight * 0.557)

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
          height: trackHeight,
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
        {/* sleepers – pattern tiles at fixed pitch regardless of container width */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id="track-sleepers" x="0" y="0" width="72" height={trackHeight} patternUnits="userSpaceOnUse">
              <rect x="4" y={slpY} width="28" height={slpH} rx="3" fill={t.tie} />
              <rect x="40" y={slpY} width="28" height={slpH} rx="3" fill={t.tieDark} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#track-sleepers)" opacity={activeOver ? 0.4 : 0.9} />
        </svg>

        {/* rails */}
        <div
          className="absolute inset-x-0"
          style={{
            top: railOff, height: 6,
            background: `linear-gradient(180deg, ${t.railHi}, ${t.rail})`,
            boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
          }}
        />
        <div
          className="absolute inset-x-0"
          style={{
            bottom: railOff, height: 6,
            background: `linear-gradient(180deg, ${t.railHi}, ${t.rail})`,
            boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
          }}
        />

        <Signal isGo={isDeparting} trackHeight={trackHeight} />

        {/* train row */}
        <div
          className={`absolute inset-0 flex items-center gap-0 overflow-y-hidden ${
            isDeparting ? 'overflow-x-hidden train-depart' : 'overflow-x-auto'
          }`}
          style={{ paddingLeft: padL, paddingRight: 16 }}
        >
          {trainItems.length === 0 ? (
            <div className="flex gap-1 opacity-30 select-none pointer-events-none items-center">
              <PlaceholderLoco size={locoSz} />
              <PlaceholderWagon size={wagonSz} />
              <PlaceholderWagon size={wagonSz} />
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
                    <Icon size={item.kind === 'loco' ? locoSz : wagonSz} />
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
