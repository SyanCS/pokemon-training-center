import type { TrainingService } from '../services/training.ts'
import type { GraphState } from '../graph/state.ts'

export function createListLessonsNode(trainingService: TrainingService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    if (state.intent?.intent !== 'list_lessons') {
      return { actionResult: { success: false, message: 'Invalid intent for listing lessons.' } }
    }

    const result = await trainingService.getLessonInfo(state.intent.lesson_type ?? undefined)
    return { actionResult: result }
  }
}
