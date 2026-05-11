import type { Task } from '../types'

interface Props {
  task: Task
}

export function TaskDisplay({ task }: Props) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl shadow-lg px-4 py-3 border-2 border-yellow-300 shrink-0">
      <span className="text-5xl font-black text-gray-800 leading-none">{task.count}</span>
      <span className="text-6xl leading-none">{task.cargo.emoji}</span>
    </div>
  )
}
