import type { TrainingService } from '../services/training.ts'
import type { GraphState } from '../graph/state.ts'

export function createRecommendNode(trainingService: TrainingService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    if (state.intent?.intent !== 'recommend_lesson') {
      return { actionResult: { success: false, message: 'Invalid intent for recommendations.' } }
    }

    const result = await trainingService.getRecommendations(state.intent.pokemon_nickname, state.intent.pokemon_species)
    return { actionResult: result }
  }
}
