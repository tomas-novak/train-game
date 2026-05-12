import type { FC } from 'react'
import type { KeyedTrainItem, TrainItem, TrainIcon } from '../types'
import { LOCOMOTIVES } from '../data/locomotives'
import { WAGONS } from '../data/wagons'
import { SKY } from '../theme'

const t = SKY

export interface DragStartPayload {
  item: TrainItem
  Icon: FC<TrainIcon>
  iconSize: number
}

interface PaletteCardProps {
  Icon: FC<TrainIcon>
  iconSize: number
  dimmed: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

function PaletteCard({ Icon, iconSize, dimmed, onPointerDown }: PaletteCardProps) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={`rounded-2xl touch-none select-none cursor-grab active:cursor-grabbing transition-all duration-150 flex items-center justify-center ${
        dimmed ? 'opacity-25 scale-90' : 'hover:-translate-y-1'
      }`}
      style={{
        background: t.panel,
        padding: 8,
        minWidth: 92,
        minHeight: 76,
        boxShadow: `0 6px 14px ${t.softShadow}, inset 0 -3px 0 ${t.panelEdge}`,
      }}
    >
      <Icon size={iconSize} />
    </div>
  )
}

interface Props {
  trainItems: KeyedTrainItem[]
  onDragStart: (payload: DragStartPayload, e: React.PointerEvent) => void
}

export function DragPalette({ trainItems, onDragStart }: Props) {
  const hasLoco = trainItems.some((item) => item.kind === 'loco')
  const placedWagonType = (
    trainItems.find((item) => item.kind === 'wagon') as Extract<KeyedTrainItem, { kind: 'wagon' }> | undefined
  )?.type

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Locomotives row */}
      <div className="flex gap-3 justify-center flex-wrap">
        {LOCOMOTIVES.map((loco) => (
          <PaletteCard
            key={loco.id}
            Icon={loco.icon}
            iconSize={86}
            dimmed={hasLoco}
            onPointerDown={(e) => {
              e.preventDefault()
              onDragStart({ item: { kind: 'loco', id: loco.id }, Icon: loco.icon, iconSize: 96 }, e)
            }}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="h-px w-10" style={{ background: t.panelEdge }} />
        <div className="rounded-full" style={{ width: 6, height: 6, background: t.inkSoft, opacity: 0.5 }} />
        <div className="h-px w-10" style={{ background: t.panelEdge }} />
      </div>

      {/* Wagons row */}
      <div className="flex gap-2 justify-center flex-wrap">
        {WAGONS.map((wagon) => {
          const dimmed = placedWagonType !== undefined && placedWagonType !== wagon.type
          return (
            <PaletteCard
              key={wagon.type}
              Icon={wagon.icon}
              iconSize={70}
              dimmed={dimmed}
              onPointerDown={(e) => {
                e.preventDefault()
                onDragStart({ item: { kind: 'wagon', type: wagon.type }, Icon: wagon.icon, iconSize: 80 }, e)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
