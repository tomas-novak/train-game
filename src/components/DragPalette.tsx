import type { FC } from 'react'
import type { KeyedTrainItem, TrainItem, TrainIcon } from '../types'
import { LOCOMOTIVES } from '../data/locomotives'
import { WAGONS } from '../data/wagons'

export interface DragStartPayload {
  item: TrainItem
  Icon: FC<TrainIcon>
}

interface Props {
  trainItems: KeyedTrainItem[]
  onDragStart: (payload: DragStartPayload, e: React.PointerEvent) => void
}

interface PaletteItemProps {
  Icon: FC<TrainIcon>
  iconSize: number
  dimmed: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

function PaletteItem({ Icon, iconSize, dimmed, onPointerDown }: PaletteItemProps) {
  return (
    <div
      className={[
        'bg-white rounded-2xl p-2 min-w-[80px] min-h-[68px]',
        'flex items-center justify-center shadow-md border-2 border-gray-200',
        'cursor-grab active:cursor-grabbing touch-none select-none transition-all duration-150',
        dimmed
          ? 'opacity-25 scale-90'
          : 'hover:scale-110 hover:shadow-xl hover:border-yellow-400 active:scale-95',
      ].join(' ')}
      onPointerDown={onPointerDown}
    >
      <Icon size={iconSize} />
    </div>
  )
}

export function DragPalette({ trainItems, onDragStart }: Props) {
  const hasLoco = trainItems.some((t) => t.kind === 'loco')
  const placedWagonType = (
    trainItems.find((t) => t.kind === 'wagon') as Extract<KeyedTrainItem, { kind: 'wagon' }> | undefined
  )?.type

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Locomotives */}
      <div className="flex gap-3 justify-center flex-wrap">
        {LOCOMOTIVES.map((loco) => (
          <PaletteItem
            key={loco.id}
            Icon={loco.icon}
            iconSize={72}
            dimmed={hasLoco}
            onPointerDown={(e) => {
              e.preventDefault()
              onDragStart({ item: { kind: 'loco', id: loco.id }, Icon: loco.icon }, e)
            }}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-24 h-0.5 bg-gray-300 rounded" />

      {/* Wagons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {WAGONS.map((wagon) => {
          const dimmed = placedWagonType !== undefined && placedWagonType !== wagon.type
          return (
            <PaletteItem
              key={wagon.type}
              Icon={wagon.icon}
              iconSize={60}
              dimmed={dimmed}
              onPointerDown={(e) => {
                e.preventDefault()
                onDragStart(
                  { item: { kind: 'wagon', type: wagon.type }, Icon: wagon.icon },
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
