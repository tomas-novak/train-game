import type { Task, ValidationResult, WagonType } from '../types'

export function validateTrain(
  task: Task,
  locomotiveId: string | null,
  selectedWagonType: WagonType | null,
  wagonCount: number,
): ValidationResult {
  const locomotiveOk = locomotiveId !== null
  const wagonTypeOk = selectedWagonType === task.cargo.wagonType
  const wagonCountOk = wagonCount === task.count

  return {
    locomotiveOk,
    wagonTypeOk,
    wagonCountOk,
    allCorrect: locomotiveOk && wagonTypeOk && wagonCountOk,
  }
}
