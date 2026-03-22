import type { TrainingService } from '../services/training.ts'
import type { GraphState } from '../graph/state.ts'

export function createScheduleNode(trainingService: TrainingService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    if (state.intent?.intent !== 'schedule_lesson') {
      return { actionResult: { success: false, message: 'Invalid intent for scheduling.' } }
    }

    const result = await trainingService.schedulePokemon(
      state.intent.pokemon_nickname,
      state.intent.lesson_type,
      state.intent.datetime,
      state.intent.pokemon_species,
    )
    return { actionResult: result }
  }
}
