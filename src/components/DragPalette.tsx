import type { TrainItem, WagonType } from '../types'
import { LOCOMOTIVES } from '../data/locomotives'
import { WAGONS } from '../data/wagons'

export interface DragStartPayload {
  item: TrainItem
  emoji: string
}

interface Props {
  trainItems: TrainItem[]
  onDragStart: (payload: DragStartPayload, e: React.PointerEvent) => void
}

interface PaletteItemProps {
  emoji: string
  dimmed: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

function PaletteItem({ emoji, dimmed, onPointerDown }: PaletteItemProps) {
  return (
    <div
      className={[
        'text-5xl bg-white rounded-2xl p-3 min-w-[72px] min-h-[72px]',
        'flex items-center justify-center shadow-md border-2 border-gray-200',
        'cursor-grab active:cursor-grabbing touch-none select-none transition-all duration-150',
        dimmed
          ? 'opacity-25 scale-90'
          : 'hover:scale-110 hover:shadow-xl hover:border-yellow-400 active:scale-95',
      ].join(' ')}
      onPointerDown={onPointerDown}
    >
      {emoji}
    </div>
  )
}

export function DragPalette({ trainItems, onDragStart }: Props) {
  const hasLoco = trainItems.some((t) => t.kind === 'loco')
  const placedWagonType = (
    trainItems.find((t) => t.kind === 'wagon') as Extract<TrainItem, { kind: 'wagon' }> | undefined
  )?.type

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Locomotives */}
      <div className="flex gap-3 justify-center flex-wrap">
        {LOCOMOTIVES.map((loco) => (
          <PaletteItem
            key={loco.id}
            emoji={loco.emoji}
            dimmed={hasLoco}
            onPointerDown={(e) => {
              e.preventDefault()
              onDragStart({ item: { kind: 'loco', id: loco.id }, emoji: loco.emoji }, e)
            }}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-24 h-0.5 bg-gray-300 rounded" />

      {/* Wagons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {WAGONS.map((wagon) => {
          const dimmed =
            placedWagonType !== undefined && placedWagonType !== (wagon.type as WagonType)
          return (
            <PaletteItem
              key={wagon.type}
              emoji={wagon.emoji}
              dimmed={dimmed}
              onPointerDown={(e) => {
                e.preventDefault()
                onDragStart(
                  { item: { kind: 'wagon', type: wagon.type }, emoji: wagon.emoji },
                  e,
                )
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
