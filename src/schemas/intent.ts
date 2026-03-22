import { z } from 'zod'

export const EnrollIntent = z.object({
  intent: z.literal('enroll_pokemon'),
  species: z.string().describe('The Pokemon species name, e.g. "squirtle", "charmander"'),
  nickname: z.string().optional().describe('The trainer-given nickname for this Pokemon. Only set if the user explicitly provides one — do NOT invent a nickname.'),
})

export const ScheduleIntent = z.object({
  intent: z.literal('schedule_lesson'),
  pokemon_nickname: z.string().describe('The nickname of the enrolled Pokemon'),
  pokemon_species: z.string().optional().describe('The Pokemon species if mentioned for disambiguation'),
  lesson_type: z.string().describe('The type of lesson, e.g. "Swim Training", "Fire Control"'),
  datetime: z.string().describe('The requested date/time in ISO 8601 format'),
})

export const CancelIntent = z.object({
  intent: z.literal('cancel_lesson'),
  pokemon_nickname: z.string().describe('The nickname of the enrolled Pokemon'),
  pokemon_species: z.string().optional().describe('The Pokemon species if mentioned for disambiguation'),
  datetime: z.string().describe('The date/time of the lesson to cancel in ISO 8601 format'),
})

export const RecommendIntent = z.object({
  intent: z.literal('recommend_lesson'),
  pokemon_nickname: z.string().describe('The nickname of the enrolled Pokemon'),
  pokemon_species: z.string().optional().describe('The Pokemon species if mentioned for disambiguation'),
})

export const ListLessonsIntent = z.object({
  intent: z.literal('list_lessons'),
  lesson_type: z.string().optional().describe('Optional: specific lesson category to get info about. Leave empty to list all.'),
})

export const ViewScheduleIntent = z.object({
  intent: z.literal('view_schedule'),
  pokemon_nickname: z.string().describe('The nickname of the enrolled Pokemon whose schedule to view'),
  pokemon_species: z.string().optional().describe('The Pokemon species if mentioned for disambiguation'),
})

export const IntentSchema = z.discriminatedUnion('intent', [
  EnrollIntent,
  ScheduleIntent,
  CancelIntent,
  RecommendIntent,
  ListLessonsIntent,
  ViewScheduleIntent,
])

// Flat schema for generateObject — discriminated unions don't work with OpenAI-compatible structured output
// All fields required (OpenAI constraint) — use nullable for optional fields
export const FlatIntentSchema = z.object({
  intent: z.enum(['enroll_pokemon', 'schedule_lesson', 'cancel_lesson', 'recommend_lesson', 'list_lessons', 'view_schedule', 'unknown'])
    .describe('The classified intent. Use "unknown" if the message is gibberish, unclear, or does not relate to Pokemon training.'),
  species: z.string().nullable().describe('For enroll_pokemon: the Pokemon species name. Null otherwise.'),
  nickname: z.string().nullable().describe('For enroll_pokemon: the trainer-given nickname. Null if not provided or not enroll.'),
  pokemon_nickname: z.string().nullable().describe('For schedule/cancel/recommend/view_schedule: the nickname of the enrolled Pokemon. Null otherwise.'),
  pokemon_species: z.string().nullable().describe('The Pokemon species if mentioned for disambiguation (e.g. "Sparky the pikachu" → "pikachu"). Null if not mentioned.'),
  lesson_type: z.string().nullable().describe('For schedule_lesson or list_lessons: the lesson category name. Null otherwise.'),
  datetime: z.string().nullable().describe('For schedule_lesson or cancel_lesson: ISO 8601 date/time. Null otherwise.'),
})

export type Intent = z.infer<typeof IntentSchema>
