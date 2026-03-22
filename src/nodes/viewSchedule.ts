import type { TrainingService } from '../services/training.ts'
import type { GraphState } from '../graph/state.ts'

export function createViewScheduleNode(trainingService: TrainingService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    if (state.intent?.intent !== 'view_schedule') {
      return { actionResult: { success: false, message: 'Invalid intent for viewing schedule.' } }
    }

    const result = await trainingService.getSchedule(state.intent.pokemon_nickname, state.intent.pokemon_species)
    return { actionResult: result }
  }
}
