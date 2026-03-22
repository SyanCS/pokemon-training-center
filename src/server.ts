import Fastify from 'fastify'
import { HumanMessage } from '@langchain/core/messages'
import { createGraph } from './graph/factory.ts'
import { prisma } from './db.ts'

const app = Fastify({ logger: true })
const graph = createGraph()

app.get('/health', async () => ({ status: 'ok' }))

app.get('/trainers', async () => {
  const instructors = await prisma.instructor.findMany()
  const categories = await prisma.lessonCategory.findMany()

  return instructors.map((i) => {
    const specialtyIds = i.specialties.split(',').map(Number)
    const specialtyNames = categories
      .filter((c) => specialtyIds.includes(c.id))
      .map((c) => c.name)

    return {
      name: i.name,
      spriteUrl: i.spriteUrl,
      specialties: specialtyNames,
    }
  })
})

app.get('/lessons', async () => {
  const categories = await prisma.lessonCategory.findMany()
  const allLessons = await prisma.lesson.findMany({
    include: { instructor: true },
  })

  return categories.map((c) => {
    const lesson = allLessons.find((l) => l.categoryId === c.id)
    return {
      name: c.name,
      description: c.description,
      allowedTypes: c.allowedTypes.split(','),
      instructor: lesson?.instructor.name ?? 'TBA',
    }
  })
})

app.post<{ Body: { message: string } }>('/chat', {
  schema: {
    body: {
      type: 'object',
      required: ['message'],
      properties: {
        message: { type: 'string', minLength: 1 },
      },
    },
  },
}, async (request, reply) => {
  const { message } = request.body

  const result = await graph.invoke({
    messages: [new HumanMessage(message)],
  })

  return {
    response: result.responseText ?? 'Sorry, I could not process your request.',
    intent: result.intent,
    data: result.actionResult?.data ?? null,
  }
})

const port = parseInt(process.env.PORT ?? '3000', 10)

app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`Pokemon Training Center API running on http://localhost:${port}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
