import type { Task } from '../types'

interface Props {
  task: Task
  level: number
}

export function TaskDisplay({ task, level }: Props) {
  const stars = '⭐'.repeat(level)

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="text-2xl">{stars}</div>
      <div className="flex items-center justify-center gap-8 bg-white rounded-3xl shadow-lg px-10 py-6 border-4 border-yellow-300">
        <span className="text-8xl font-black text-gray-800 leading-none">{task.count}</span>
        <span className="text-9xl leading-none">{task.cargo.emoji}</span>
      </div>
    </div>
  )
}
