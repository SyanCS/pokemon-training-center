import type { PrismaClient } from '@prisma/client'
import { getSpecies } from './pokeapi.ts'

export interface ActionResult {
  success: boolean
  message: string
  data?: unknown
}

export class TrainingService {
  prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async findAllByNickname(nickname: string) {
    const students = await this.prisma.pokemonStudent.findMany({
      where: { nickname: { equals: nickname } },
    })
    if (students.length > 0) return students

    // Fallback: case-insensitive search via fetching all and filtering
    const all = await this.prisma.pokemonStudent.findMany()
    return all.filter((s) => s.nickname.toLowerCase() === nickname.toLowerCase())
  }

  async resolveStudent(nickname: string, species?: string): Promise<{ student: Awaited<ReturnType<typeof this.findAllByNickname>>[0] } | ActionResult> {
    if (!nickname) {
      return { success: false, message: 'Please tell me the nickname of your Pokemon.' }
    }
    const matches = await this.findAllByNickname(nickname)
    if (matches.length === 0) {
      return { success: false, message: `I don't know a Pokemon called "${nickname}". Would you like to enroll them first?` }
    }

    if (matches.length === 1) {
      return { student: matches[0] }
    }

    // Multiple matches — try to disambiguate by species
    if (species) {
      const bySpecies = matches.find((s) => s.species.toLowerCase() === species.toLowerCase())
      if (bySpecies) return { student: bySpecies }
    }

    // Can't disambiguate — ask the user
    const list = matches.map((s) => `${s.nickname} the ${s.species}`).join(', ')
    return {
      success: false,
      message: `There are multiple Pokemon named "${nickname}": ${list}. Please specify which one — for example, "${nickname} the ${matches[0].species}".`,
    }
  }

  // Keep backward compat for simple lookups
  async findStudentByNickname(nickname: string) {
    const matches = await this.findAllByNickname(nickname)
    return matches[0] ?? null
  }

  async enrollPokemon(species: string, nickname: string): Promise<ActionResult> {
    const speciesData = await getSpecies(species)
    if (!speciesData) {
      return { success: false, message: `"${species}" is not a valid Pokemon species. Please check the name and try again.` }
    }

    const allStudents = await this.prisma.pokemonStudent.findMany({
      where: { species: speciesData.name },
    })
    const existing = allStudents.find((s) => s.nickname.toLowerCase() === nickname.toLowerCase())
    if (existing) {
      return { success: false, message: `A ${speciesData.name} named "${nickname}" is already enrolled.` }
    }

    const student = await this.prisma.pokemonStudent.create({
      data: {
        species: speciesData.name,
        nickname,
        types: speciesData.types.join(','),
        pokeApiId: speciesData.id,
        spriteUrl: speciesData.spriteUrl,
      },
    })

    return {
      success: true,
      message: `${nickname} the ${speciesData.name} has been enrolled! Types: ${speciesData.types.join(', ')}.`,
      data: student,
    }
  }

  async schedulePokemon(nickname: string, lessonType: string, datetime: string, species?: string): Promise<ActionResult> {
    const resolved = await this.resolveStudent(nickname, species)
    if (!('student' in resolved)) return resolved
    const student = resolved.student

    // Find matching category (case-insensitive partial match)
    const categories = await this.prisma.lessonCategory.findMany()
    const category = categories.find(
      (c) => c.name.toLowerCase().includes(lessonType.toLowerCase()) ||
             lessonType.toLowerCase().includes(c.name.toLowerCase())
    )
    if (!category) {
      const available = categories.map((c) => c.name).join(', ')
      return { success: false, message: `No lesson category matches "${lessonType}". Available: ${available}` }
    }

    // Check type eligibility
    const studentTypes = student.types.split(',')
    const allowedTypes = category.allowedTypes.split(',')
    const eligible = studentTypes.some((t) => allowedTypes.includes(t))
    if (!eligible) {
      return {
        success: false,
        message: `${nickname} is a ${student.types} type, but ${category.name} is only for ${category.allowedTypes} types. ${nickname} is not eligible for this lesson.`,
      }
    }

    // Find available lesson closest to requested datetime
    const requestedDate = new Date(datetime)
    const lessons = await this.prisma.lesson.findMany({
      where: { categoryId: category.id },
      include: { bookings: { where: { status: 'booked' } }, instructor: true },
    })

    const availableLessons = lessons.filter((l) => l.bookings.length < l.maxCapacity)
    if (availableLessons.length === 0) {
      return { success: false, message: `No available ${category.name} lessons with open spots. Try again later.` }
    }

    // Pick the lesson closest to the requested date
    const lesson = availableLessons.reduce((best, current) => {
      const bestDiff = Math.abs(best.datetime.getTime() - requestedDate.getTime())
      const currDiff = Math.abs(current.datetime.getTime() - requestedDate.getTime())
      return currDiff < bestDiff ? current : best
    })

    // Check no double-booking at same datetime
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        studentId: student.id,
        status: 'booked',
        lesson: { datetime: lesson.datetime },
      },
    })
    if (existingBooking) {
      return { success: false, message: `${nickname} already has a booking at ${lesson.datetime.toISOString()}.` }
    }

    const booking = await this.prisma.booking.create({
      data: { studentId: student.id, lessonId: lesson.id },
      include: { lesson: { include: { category: true, instructor: true } } },
    })

    return {
      success: true,
      message: `${nickname} is booked for ${category.name} on ${lesson.datetime.toISOString()} with Instructor ${lesson.instructor.name}.`,
      data: booking,
    }
  }

  async cancelBooking(nickname: string, datetime: string, species?: string): Promise<ActionResult> {
    const resolved = await this.resolveStudent(nickname, species)
    if (!('student' in resolved)) return resolved
    const student = resolved.student

    const requestedDate = new Date(datetime)

    // Find active bookings for this student
    const bookings = await this.prisma.booking.findMany({
      where: { studentId: student.id, status: 'booked' },
      include: { lesson: { include: { category: true, instructor: true } } },
    })

    if (bookings.length === 0) {
      return { success: false, message: `${nickname} doesn't have any active bookings to cancel.` }
    }

    // Find the booking closest to the requested datetime
    const booking = bookings.reduce((best, current) => {
      const bestDiff = Math.abs(best.lesson.datetime.getTime() - requestedDate.getTime())
      const currDiff = Math.abs(current.lesson.datetime.getTime() - requestedDate.getTime())
      return currDiff < bestDiff ? current : best
    })

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'canceled' },
    })

    return {
      success: true,
      message: `Canceled ${nickname}'s ${booking.lesson.category.name} lesson on ${booking.lesson.datetime.toISOString()} with Instructor ${booking.lesson.instructor.name}.`,
      data: booking,
    }
  }

  async getRecommendations(nickname: string, species?: string): Promise<ActionResult> {
    const resolved = await this.resolveStudent(nickname, species)

    let pokemonName: string
    let pokemonTypes: string[]
    let spriteUrl: string | null = null
    let isEnrolled = true

    if ('student' in resolved) {
      const student = resolved.student
      pokemonName = student.nickname
      pokemonTypes = student.types.split(',')
      spriteUrl = student.spriteUrl
    } else {
      // Not enrolled — try looking up as a species via PokeAPI
      const speciesName = species || nickname
      const speciesData = await getSpecies(speciesName)
      if (!speciesData) {
        return resolved // Return the original "not found" error
      }
      pokemonName = speciesData.name
      pokemonTypes = speciesData.types
      spriteUrl = speciesData.spriteUrl
      isEnrolled = false
    }

    const categories = await this.prisma.lessonCategory.findMany()

    const recommended = categories.filter((c) => {
      const allowedTypes = c.allowedTypes.split(',')
      return pokemonTypes.some((t) => allowedTypes.includes(t))
    })

    if (recommended.length === 0) {
      return {
        success: true,
        message: `No lessons currently match ${pokemonName}'s type(s): ${pokemonTypes.join(', ')}. Check back later for new offerings!`,
        data: { pokemon: { name: pokemonName, types: pokemonTypes.join(','), spriteUrl }, recommendations: [] },
      }
    }

    const enrollNote = isEnrolled ? '' : ` (not enrolled yet — enroll ${pokemonName} to book lessons!)`
    return {
      success: true,
      message: `${pokemonName} (${pokemonTypes.join(', ')} type) is eligible for: ${recommended.map((c) => c.name).join(', ')}.${enrollNote}`,
      data: { pokemon: { name: pokemonName, types: pokemonTypes.join(','), spriteUrl }, recommendations: recommended },
    }
  }

  async getLessonInfo(lessonType?: string): Promise<ActionResult> {
    const categories = await this.prisma.lessonCategory.findMany()
    const allLessons = await this.prisma.lesson.findMany({
      include: {
        category: true,
        instructor: true,
        bookings: { where: { status: 'booked' } },
      },
    })

    if (lessonType?.trim()) {
      // Find specific category
      const category = categories.find(
        (c) => c.name.toLowerCase().includes(lessonType.toLowerCase()) ||
               lessonType.toLowerCase().includes(c.name.toLowerCase())
      )
      if (!category) {
        const available = categories.map((c) => c.name).join(', ')
        return { success: false, message: `No lesson category matches "${lessonType}". Available: ${available}` }
      }

      const lessons = allLessons.filter((l) => l.categoryId === category.id)
      const instructor = lessons[0]?.instructor

      const instructorInfo = instructor
        ? `Instructor: ${instructor.name} (${instructor.spriteUrl})`
        : 'Instructor: TBA'
      return {
        success: true,
        message: `${category.name}: ${category.description} (For ${category.allowedTypes} types). ${instructorInfo}. ${lessons.length} sessions available.`,
        data: {
          category: { id: category.id, name: category.name, description: category.description, allowedTypes: category.allowedTypes },
          instructor: instructor ? { name: instructor.name, spriteUrl: instructor.spriteUrl } : null,
          sessions: lessons.map((l) => ({
            datetime: l.datetime.toISOString(),
            spotsLeft: l.maxCapacity - l.bookings.length,
          })),
        },
      }
    }

    // List all categories with their instructors
    const categoryList = categories.map((c) => {
      const lessons = allLessons.filter((l) => l.categoryId === c.id)
      const instructor = lessons[0]?.instructor
      return {
        name: c.name,
        description: c.description,
        allowedTypes: c.allowedTypes,
        instructor: instructor ? { name: instructor.name, spriteUrl: instructor.spriteUrl } : null,
        sessionCount: lessons.length,
      }
    })

    const summary = categoryList.map((c) => {
      const instructorInfo = c.instructor
        ? `Instructor: ${c.instructor.name} (${c.instructor.spriteUrl})`
        : 'Instructor: TBA'
      return `- ${c.name}: ${c.description} | Types: ${c.allowedTypes} | ${instructorInfo} | ${c.sessionCount} sessions`
    }).join('\n')
    return {
      success: true,
      message: `We offer ${categoryList.length} lesson categories:\n${summary}`,
      data: { categories: categoryList },
    }
  }

  async getSchedule(nickname: string, species?: string): Promise<ActionResult> {
    const resolved = await this.resolveStudent(nickname, species)
    if (!('student' in resolved)) return resolved
    const student = resolved.student

    const bookings = await this.prisma.booking.findMany({
      where: { studentId: student.id, status: 'booked' },
      include: { lesson: { include: { category: true, instructor: true } } },
    })

    if (bookings.length === 0) {
      return {
        success: true,
        message: `${nickname} the ${student.species} doesn't have any upcoming lessons scheduled.`,
        data: {
          pokemon: { nickname: student.nickname, species: student.species, spriteUrl: student.spriteUrl, types: student.types },
          lessons: [],
        },
      }
    }

    const lessonList = bookings
      .sort((a, b) => a.lesson.datetime.getTime() - b.lesson.datetime.getTime())
      .map((b) => ({
        lessonName: b.lesson.category.name,
        datetime: b.lesson.datetime.toISOString(),
        instructor: { name: b.lesson.instructor.name, spriteUrl: b.lesson.instructor.spriteUrl },
      }))

    return {
      success: true,
      message: `${nickname} has ${bookings.length} upcoming lesson(s).`,
      data: {
        pokemon: { nickname: student.nickname, species: student.species, spriteUrl: student.spriteUrl, types: student.types },
        lessons: lessonList,
      },
    }
  }
}
