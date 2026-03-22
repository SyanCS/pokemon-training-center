import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { PrismaClient } from '@prisma/client'
import { HumanMessage } from '@langchain/core/messages'
import { TrainingService } from '../src/services/training.ts'
import { chatModel } from '../src/lib/ai/client.ts'
import { buildGraph } from '../src/graph/graph.ts'

const prisma = new PrismaClient()
let graph: ReturnType<typeof buildGraph>

before(async () => {
  const trainingService = new TrainingService(prisma)
  graph = buildGraph(chatModel, trainingService)

  // Seed test data
  await prisma.booking.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.instructor.deleteMany()
  await prisma.lessonCategory.deleteMany()
  await prisma.pokemonStudent.deleteMany()

  const swim = await prisma.lessonCategory.create({ data: { name: 'Swim Training', allowedTypes: 'water' } })
  const misty = await prisma.instructor.create({ data: { name: 'Misty', specialties: String(swim.id) } })

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  await prisma.lesson.create({ data: { categoryId: swim.id, instructorId: misty.id, datetime: tomorrow, maxCapacity: 3 } })
})

after(async () => {
  await prisma.booking.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.instructor.deleteMany()
  await prisma.lessonCategory.deleteMany()
  await prisma.pokemonStudent.deleteMany()
  await prisma.$disconnect()
})

describe('Graph E2E', () => {
  it('should handle enrollment request', async () => {
    const result = await graph.invoke({
      messages: [new HumanMessage('I want to enroll my Squirtle, call him Bubbles')],
    })

    assert.ok(result.responseText)
    assert.ok(result.intent)
    assert.equal(result.intent.intent, 'enroll_pokemon')
    console.log('Enrollment response:', result.responseText)
  })

  it('should handle FAQ', async () => {
    const result = await graph.invoke({
      messages: [new HumanMessage('What types of training do you offer?')],
    })

    assert.ok(result.responseText)
    assert.equal(result.intent?.intent, 'faq')
    console.log('FAQ response:', result.responseText)
  })
})
