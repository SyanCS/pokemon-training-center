import { chatModel } from '../lib/ai/client.ts'
import { prisma } from '../db.ts'
import { TrainingService } from '../services/training.ts'
import { buildGraph } from './graph.ts'

export function createGraph() {
  const trainingService = new TrainingService(prisma)
  return buildGraph(chatModel, trainingService)
}
