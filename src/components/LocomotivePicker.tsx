import { LOCOMOTIVES } from '../data/locomotives'

interface Props {
  selected: string | null
  onSelect: (id: string) => void
  highlight: boolean
}

export function LocomotivePicker({ selected, onSelect, highlight }: Props) {
  return (
    <div className="flex justify-center gap-4 flex-wrap">
      {LOCOMOTIVES.map((loco) => {
        const isSelected = selected === loco.id
        return (
          <button
            key={loco.id}
            onClick={() => onSelect(loco.id)}
            className={[
              'text-6xl rounded-2xl p-3 min-w-[80px] min-h-[80px] transition-all duration-150 select-none',
              'flex items-center justify-center',
              isSelected
                ? 'bg-green-300 ring-4 ring-green-500 scale-110 shadow-lg'
                : highlight
                  ? 'bg-red-100 ring-4 ring-red-400 animate-bounce'
                  : 'bg-white ring-4 ring-gray-200 hover:bg-yellow-50 active:scale-95 shadow',
            ].join(' ')}
          >
            {loco.emoji}
          </button>
        )
      })}
    </div>
  )
}
