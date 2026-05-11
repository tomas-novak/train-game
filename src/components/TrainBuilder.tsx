import type { WagonType } from '../types'
import { WAGONS } from '../data/wagons'

interface Props {
  locomotiveId: string | null
  selectedWagonType: WagonType | null
  wagonCount: number
  onIncrement: () => void
  onDecrement: () => void
  countHighlight: boolean
}

export function TrainBuilder({
  locomotiveId,
  selectedWagonType,
  wagonCount,
  onIncrement,
  onDecrement,
  countHighlight,
}: Props) {
  const wagonDef = WAGONS.find((w) => w.type === selectedWagonType)

  const locoEmojis: Record<string, string> = {
    steam: '🚂',
    electric: '🚆',
    diesel: '🚇',
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Train visual */}
      <div className="w-full overflow-x-auto">
        <div className="flex items-end gap-1 min-h-[72px] px-4 py-2 bg-white rounded-2xl shadow-inner border-2 border-gray-100 min-w-fit mx-auto">
          {locomotiveId ? (
            <span className="text-5xl leading-none shrink-0">{locoEmojis[locomotiveId]}</span>
          ) : (
            <span className="text-5xl leading-none opacity-20 shrink-0">🚂</span>
          )}
          {wagonDef &&
            Array.from({ length: wagonCount }).map((_, i) => (
              <span key={i} className="text-4xl leading-none shrink-0">
                {wagonDef.emoji}
              </span>
            ))}
          {!wagonDef && wagonCount === 0 && (
            <span className="text-4xl leading-none opacity-20 ml-1">🟫🟫🟫</span>
          )}
        </div>
      </div>

      {/* Counter controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={onDecrement}
          disabled={wagonCount === 0}
          className="text-4xl font-black rounded-full w-16 h-16 bg-red-400 text-white flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          −
        </button>

        <div
          className={[
            'text-6xl font-black w-24 h-24 rounded-2xl flex items-center justify-center shadow transition-all',
            countHighlight
              ? 'bg-red-200 ring-4 ring-red-500 text-red-700'
              : 'bg-white text-gray-800',
          ].join(' ')}
        >
          {wagonCount}
        </div>

        <button
          onClick={onIncrement}
          disabled={wagonCount === 10}
          className="text-4xl font-black rounded-full w-16 h-16 bg-green-500 text-white flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          +
        </button>
      </div>
    </div>
  )
}
