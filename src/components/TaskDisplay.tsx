import { useState, useEffect } from 'react'
import type { Task } from '../types'
import { CARGO } from '../data/cargo'
import { WAGONS } from '../data/wagons'

interface Props {
  task: Task
}

const WAGON_GROUPS = WAGONS.map((wagon) => ({
  wagon,
  cargoList: CARGO.filter((c) => c.wagonType === wagon.type),
})).filter((g) => g.cargoList.length > 0)

export function TaskDisplay({ task }: Props) {
  const [showHelp, setShowHelp] = useState(false)
  const Icon = task.cargo.icon

  useEffect(() => {
    if (!showHelp) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowHelp(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showHelp])

  return (
    <>
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-lg px-4 py-3 border-2 border-yellow-300 shrink-0">
        <span className="text-5xl font-black text-gray-800 leading-none">{task.count}</span>
        <Icon size={56} />
        <button
          onClick={() => setShowHelp(true)}
          className="w-16 h-16 rounded-full bg-yellow-300 text-gray-800 text-lg font-black flex items-center justify-center shadow active:scale-90 hover:bg-yellow-400 transition-all leading-none"
          aria-label="Help"
        >
          ?
        </button>
      </div>

      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-5 flex flex-col gap-2 mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-3 right-3 w-16 h-16 rounded-full bg-gray-200 text-gray-700 text-lg font-black flex items-center justify-center hover:bg-gray-300 active:scale-90 transition-all leading-none"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="pr-16 pb-1">
              {WAGON_GROUPS.map(({ wagon, cargoList }) => {
                const WagonIcon = wagon.icon
                const isActive = wagon.type === task.cargo.wagonType
                return (
                  <div
                    key={wagon.type}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2 mb-1 ${isActive ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}
                  >
                    <div className="flex items-center gap-1 flex-wrap">
                      {cargoList.map((c) => {
                        const CargoIcon = c.icon
                        return <CargoIcon key={c.id} size={36} />
                      })}
                    </div>
                    <span className="text-2xl text-gray-400">→</span>
                    <WagonIcon size={48} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
