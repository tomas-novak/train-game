import { useState } from 'react'
import type { Task } from '../types'
import { WAGONS } from '../data/wagons'

interface Props {
  task: Task
}

export function TaskDisplay({ task }: Props) {
  const [showHelp, setShowHelp] = useState(false)
  const Icon = task.cargo.icon
  const wagon = WAGONS.find((w) => w.type === task.cargo.wagonType)!
  const WagonIcon = wagon.icon

  return (
    <>
      <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg px-4 py-3 border-2 border-yellow-300 shrink-0">
        <span className="text-5xl font-black text-gray-800 leading-none">{task.count}</span>
        <Icon size={56} />
        <button
          onClick={() => setShowHelp(true)}
          className="w-9 h-9 rounded-full bg-yellow-300 text-gray-800 text-lg font-black flex items-center justify-center shadow active:scale-90 hover:bg-yellow-400 transition-all leading-none"
          style={{ minWidth: 36 }}
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
            className="bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center gap-4 mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gray-200 text-gray-700 text-lg font-black flex items-center justify-center hover:bg-gray-300 active:scale-90 transition-all leading-none"
            >
              ✕
            </button>

            {/* Cargo icon × count */}
            <div className="flex items-center gap-2">
              <Icon size={56} />
              <span className="text-3xl font-black text-gray-700">×{task.count}</span>
            </div>

            {/* Arrow */}
            <span className="text-4xl">⬇️</span>

            {/* Wagon row */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
              {Array.from({ length: task.count }).map((_, i) => (
                <WagonIcon key={i} size={48} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
