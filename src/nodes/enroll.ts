import type { TrainingService } from '../services/training.ts'
import type { GraphState } from '../graph/state.ts'

export function createEnrollNode(trainingService: TrainingService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    if (state.intent?.intent !== 'enroll_pokemon') {
      return { actionResult: { success: false, message: 'Invalid intent for enrollment.' } }
    }

    if (!state.intent.nickname?.trim()) {
      return {
        actionResult: {
          success: false,
          message: `You want to enroll a ${state.intent.species}, but every Pokemon needs a nickname! What would you like to call your ${state.intent.species}?`,
        },
      }
    }

    const result = await trainingService.enrollPokemon(state.intent.species, state.intent.nickname)
    return { actionResult: result }
  }
}
