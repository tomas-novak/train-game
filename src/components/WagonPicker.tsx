import type { WagonType } from '../types'
import { WAGONS } from '../data/wagons'
import { CARGO } from '../data/cargo'

interface Props {
  selected: WagonType | null
  onSelect: (type: WagonType) => void
  highlight: boolean
}

const WAGON_CARGO_MAP: Record<WagonType, string[]> = {
  hopper: [],
  tank: [],
  box: [],
  flatcar: [],
  passenger: [],
}
for (const cargo of CARGO) {
  WAGON_CARGO_MAP[cargo.wagonType].push(cargo.emoji)
}

export function WagonPicker({ selected, onSelect, highlight }: Props) {
  return (
    <div className="flex justify-center gap-3 flex-wrap">
      {WAGONS.map((wagon) => {
        const isSelected = selected === wagon.type
        const cargoEmojis = WAGON_CARGO_MAP[wagon.type]
        return (
          <button
            key={wagon.type}
            onClick={() => onSelect(wagon.type)}
            className={[
              'flex flex-col items-center justify-center rounded-2xl p-3 min-w-[80px] min-h-[80px] transition-all duration-150 select-none gap-1',
              isSelected
                ? 'bg-green-300 ring-4 ring-green-500 scale-110 shadow-lg'
                : highlight
                  ? 'bg-red-100 ring-4 ring-red-400 animate-pulse'
                  : 'bg-white ring-4 ring-gray-200 hover:bg-yellow-50 active:scale-95 shadow',
            ].join(' ')}
          >
            <span className="text-4xl leading-none">{wagon.emoji}</span>
            <span className="text-xs leading-none">{cargoEmojis.join(' ')}</span>
          </button>
        )
      })}
    </div>
  )
}
