import { useRef, useEffect } from 'react'
import { useGameState } from './hooks/useGameState'
import { TaskDisplay } from './components/TaskDisplay'
import { LocomotivePicker } from './components/LocomotivePicker'
import { WagonPicker } from './components/WagonPicker'
import { TrainBuilder } from './components/TrainBuilder'
import { CelebrationScreen } from './components/CelebrationScreen'

export default function App() {
  const game = useGameState()
  const mainRef = useRef<HTMLDivElement>(null)

  const isWrong = game.phase === 'wrong'
  const locomotiveError = isWrong && game.validation !== null && !game.validation.locomotiveOk
  const wagonTypeError = isWrong && game.validation !== null && !game.validation.wagonTypeOk
  const wagonCountError = isWrong && game.validation !== null && !game.validation.wagonCountOk

  useEffect(() => {
    if (game.phase === 'wrong' && mainRef.current) {
      mainRef.current.classList.remove('shake')
      void mainRef.current.offsetWidth
      mainRef.current.classList.add('shake')
    }
  }, [game.phase])

  if (game.phase === 'celebrating') {
    return <CelebrationScreen />
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-yellow-100 to-sky-100 flex flex-col items-center pb-8">
      <div ref={mainRef} className="w-full max-w-2xl px-4 flex flex-col gap-6">

        {/* Task display */}
        <TaskDisplay task={game.task} level={game.progress.level} />

        {/* Pick locomotive */}
        <section className="flex flex-col gap-3">
          <LocomotivePicker
            selected={game.locomotiveId}
            onSelect={game.selectLocomotive}
            highlight={locomotiveError}
          />
        </section>

        {/* Pick wagon type */}
        <section className="flex flex-col gap-3">
          <WagonPicker
            selected={game.selectedWagonType}
            onSelect={game.selectWagonType}
            highlight={wagonTypeError}
          />
        </section>

        {/* Train builder */}
        <section className="flex flex-col gap-3">
          <TrainBuilder
            locomotiveId={game.locomotiveId}
            selectedWagonType={game.selectedWagonType}
            wagonCount={game.wagonCount}
            maxWagons={game.levelDef.maxNumber}
            onIncrement={game.incrementWagons}
            onDecrement={game.decrementWagons}
            countHighlight={wagonCountError}
          />
        </section>

        {/* Submit */}
        <button
          onClick={game.submit}
          className="mx-auto mt-2 text-5xl font-black rounded-3xl px-12 py-5 bg-orange-400 text-white shadow-xl active:scale-95 hover:bg-orange-500 transition-all select-none min-w-[200px]"
        >
          🚂 Jet!
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-3 mt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={[
                'w-5 h-5 rounded-full transition-all',
                i < game.progress.correctInLevel
                  ? 'bg-green-500 scale-125'
                  : 'bg-gray-300',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
