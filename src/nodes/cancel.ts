import type { TrainingService } from '../services/training.ts'
import type { GraphState } from '../graph/state.ts'

export function createCancelNode(trainingService: TrainingService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    if (state.intent?.intent !== 'cancel_lesson') {
      return { actionResult: { success: false, message: 'Invalid intent for cancellation.' } }
    }

    const result = await trainingService.cancelBooking(
      state.intent.pokemon_nickname,
      state.intent.datetime,
      state.intent.pokemon_species,
    )
    return { actionResult: result }
  }
}
