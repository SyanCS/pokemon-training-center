import { StateGraph, START, END } from '@langchain/langgraph'
import type { LanguageModelV1 } from 'ai'
import { GraphStateSchema, type GraphState } from './state.ts'
import { createIdentifyIntentNode } from '../nodes/identifyIntent.ts'
import { createEnrollNode } from '../nodes/enroll.ts'
import { createScheduleNode } from '../nodes/schedule.ts'
import { createCancelNode } from '../nodes/cancel.ts'
import { createRecommendNode } from '../nodes/recommend.ts'
import { createListLessonsNode } from '../nodes/listLessons.ts'
import { createViewScheduleNode } from '../nodes/viewSchedule.ts'
import { createMessageGeneratorNode } from '../nodes/messageGenerator.ts'
import type { TrainingService } from '../services/training.ts'

export function buildGraph(model: LanguageModelV1, trainingService: TrainingService) {
  const workflow = new StateGraph({ stateSchema: GraphStateSchema })
    .addNode('identifyIntent', createIdentifyIntentNode(model))
    .addNode('enroll', createEnrollNode(trainingService))
    .addNode('schedule', createScheduleNode(trainingService))
    .addNode('cancel', createCancelNode(trainingService))
    .addNode('recommend', createRecommendNode(trainingService))
    .addNode('listLessons', createListLessonsNode(trainingService))
    .addNode('viewSchedule', createViewScheduleNode(trainingService))
    .addNode('message', createMessageGeneratorNode(model))

    .addEdge(START, 'identifyIntent')

    .addConditionalEdges(
      'identifyIntent',
      (state: GraphState): string => {
        if (!state.intent) return END
        switch (state.intent.intent) {
          case 'enroll_pokemon': return 'enroll'
          case 'schedule_lesson': return 'schedule'
          case 'cancel_lesson': return 'cancel'
          case 'recommend_lesson': return 'recommend'
          case 'list_lessons': return 'listLessons'
          case 'view_schedule': return 'viewSchedule'
          default: return 'listLessons'
        }
      },
      {
        enroll: 'enroll',
        schedule: 'schedule',
        cancel: 'cancel',
        recommend: 'recommend',
        listLessons: 'listLessons',
        viewSchedule: 'viewSchedule',
        [END]: END,
      },
    )

    .addEdge('enroll', 'message')
    .addEdge('schedule', 'message')
    .addEdge('cancel', 'message')
    .addEdge('recommend', 'message')
    .addEdge('listLessons', 'message')
    .addEdge('viewSchedule', 'message')
    .addEdge('message', END)

  return workflow.compile()
}
