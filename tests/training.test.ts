import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { PrismaClient } from '@prisma/client'
import { TrainingService } from '../src/services/training.ts'

const prisma = new PrismaClient()
let service: TrainingService

before(async () => {
  service = new TrainingService(prisma)

  // Clean slate
  await prisma.booking.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.instructor.deleteMany()
  await prisma.lessonCategory.deleteMany()
  await prisma.pokemonStudent.deleteMany()

  // Seed test data
  const swim = await prisma.lessonCategory.create({ data: { name: 'Swim Training', allowedTypes: 'water' } })
  const fire = await prisma.lessonCategory.create({ data: { name: 'Fire Control', allowedTypes: 'fire' } })

  const misty = await prisma.instructor.create({ data: { name: 'Misty', specialties: String(swim.id) } })
  const blaine = await prisma.instructor.create({ data: { name: 'Blaine', specialties: String(fire.id) } })

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  await prisma.lesson.create({ data: { categoryId: swim.id, instructorId: misty.id, datetime: tomorrow, maxCapacity: 3 } })
  await prisma.lesson.create({ data: { categoryId: fire.id, instructorId: blaine.id, datetime: tomorrow, maxCapacity: 3 } })
})

after(async () => {
  await prisma.booking.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.instructor.deleteMany()
  await prisma.lessonCategory.deleteMany()
  await prisma.pokemonStudent.deleteMany()
  await prisma.$disconnect()
})

describe('TrainingService', () => {
  describe('enrollPokemon', () => {
    it('should enroll a valid Pokemon', async () => {
      const result = await service.enrollPokemon('squirtle', 'Bubbles')
      assert.equal(result.success, true)
      assert.ok(result.message.includes('Bubbles'))
      assert.ok(result.message.includes('squirtle'))
    })

    it('should reject invalid species', async () => {
      const result = await service.enrollPokemon('fakemon', 'Test')
      assert.equal(result.success, false)
      assert.ok(result.message.includes('not a valid'))
    })

    it('should reject duplicate enrollment', async () => {
      const result = await service.enrollPokemon('squirtle', 'Bubbles')
      assert.equal(result.success, false)
      assert.ok(result.message.includes('already enrolled'))
    })
  })

  describe('findStudentByNickname', () => {
    it('should find student case-insensitively', async () => {
      const student = await service.findStudentByNickname('bubbles')
      assert.ok(student)
      assert.equal(student.nickname, 'Bubbles')
    })

    it('should return null for unknown nickname', async () => {
      const student = await service.findStudentByNickname('Unknown')
      assert.equal(student, null)
    })
  })

  describe('schedulePokemon', () => {
    it('should schedule an eligible Pokemon', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const result = await service.schedulePokemon('Bubbles', 'Swim Training', tomorrow.toISOString())
      assert.equal(result.success, true)
      assert.ok(result.message.includes('booked'))
      assert.ok(result.message.includes('Misty'))
    })

    it('should reject type mismatch', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const result = await service.schedulePokemon('Bubbles', 'Fire Control', tomorrow.toISOString())
      assert.equal(result.success, false)
      assert.ok(result.message.includes('not eligible'))
    })

    it('should reject unknown Pokemon', async () => {
      const result = await service.schedulePokemon('Nobody', 'Swim Training', new Date().toISOString())
      assert.equal(result.success, false)
      assert.ok(result.message.includes("don't know"))
    })
  })

  describe('getRecommendations', () => {
    it('should recommend eligible categories', async () => {
      const result = await service.getRecommendations('Bubbles')
      assert.equal(result.success, true)
      assert.ok(result.message.includes('Swim Training'))
    })

    it('should reject unknown Pokemon', async () => {
      const result = await service.getRecommendations('Nobody')
      assert.equal(result.success, false)
      assert.ok(result.message.includes("don't know"))
    })
  })

  describe('cancelBooking', () => {
    it('should cancel an active booking', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const result = await service.cancelBooking('Bubbles', tomorrow.toISOString())
      assert.equal(result.success, true)
      assert.ok(result.message.includes('Canceled'))
    })

    it('should fail when no bookings exist', async () => {
      const result = await service.cancelBooking('Bubbles', new Date().toISOString())
      assert.equal(result.success, false)
      assert.ok(result.message.includes("doesn't have any active bookings"))
    })
  })
})
