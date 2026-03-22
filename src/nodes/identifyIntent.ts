import { generateObject } from 'ai'
import type { LanguageModelV1 } from 'ai'
import { FlatIntentSchema, IntentSchema, type Intent } from '../schemas/intent.ts'
import { getIntentSystemPrompt, getIntentUserPrompt } from '../prompts/identifyIntent.ts'
import type { GraphState } from '../graph/state.ts'

function flatToIntent(flat: Record<string, unknown>): Intent {
  switch (flat.intent) {
    case 'enroll_pokemon':
      return { intent: 'enroll_pokemon', species: flat.species as string, nickname: flat.nickname ?? undefined }
    case 'schedule_lesson':
      return { intent: 'schedule_lesson', pokemon_nickname: flat.pokemon_nickname as string, pokemon_species: flat.pokemon_species ?? undefined, lesson_type: flat.lesson_type as string, datetime: flat.datetime as string }
    case 'cancel_lesson':
      return { intent: 'cancel_lesson', pokemon_nickname: flat.pokemon_nickname as string, pokemon_species: flat.pokemon_species ?? undefined, datetime: flat.datetime as string }
    case 'recommend_lesson':
      return { intent: 'recommend_lesson', pokemon_nickname: flat.pokemon_nickname as string, pokemon_species: flat.pokemon_species ?? undefined }
    case 'list_lessons':
      return { intent: 'list_lessons', lesson_type: flat.lesson_type ?? undefined }
    case 'view_schedule':
      return { intent: 'view_schedule', pokemon_nickname: flat.pokemon_nickname as string, pokemon_species: flat.pokemon_species ?? undefined }
    case 'unknown':
    default:
      return undefined as unknown as Intent
  }
}

const LESSON_KEYWORDS: Record<string, string> = {
  swim: 'Swim Training', water: 'Swim Training',
  fire: 'Fire Control', flame: 'Fire Control', blaine: 'Fire Control',
  martial: 'Martial Arts', fighting: 'Martial Arts', bruno: 'Martial Arts',
  flight: 'Flight Training', flying: 'Flight Training', fly: 'Flight Training', falkner: 'Flight Training',
  endurance: 'Endurance Training', stamina: 'Endurance Training',
  voltage: 'Voltage Workshop', electric: 'Voltage Workshop', surge: 'Voltage Workshop',
  botanical: 'Botanical Growth', grass: 'Botanical Growth', erika: 'Botanical Growth',
  frost: 'Frost Conditioning', ice: 'Frost Conditioning', pryce: 'Frost Conditioning',
  toxin: 'Toxin Mastery', poison: 'Toxin Mastery',
  terrain: 'Terrain Shaping', ground: 'Terrain Shaping', giovanni: 'Terrain Shaping',
  psychic: 'Psychic Focus', sabrina: 'Psychic Focus',
  bug: 'Bug Tactics', burgh: 'Bug Tactics',
  rock: 'Rock Solid Defense',
  shadow: 'Shadow Arts', ghost: 'Shadow Arts', morty: 'Shadow Arts',
  dragon: 'Dragon Mastery', lance: 'Dragon Mastery',
  dark: 'Dark Strategy', karen: 'Dark Strategy',
  steel: 'Steel Forging',
  fairy: 'Fairy Charm', valerie: 'Fairy Charm',
}

function extractLessonType(message: string): string | undefined {
  const lower = message.toLowerCase()
  for (const [keyword, lessonName] of Object.entries(LESSON_KEYWORDS)) {
    if (lower.includes(keyword)) return lessonName
  }
  return undefined
}

export function createIdentifyIntentNode(model: LanguageModelV1) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const lastMessage = state.messages.at(-1)!
    try {
      const { object } = await generateObject({
        model,
        schema: FlatIntentSchema,
        system: getIntentSystemPrompt(),
        prompt: getIntentUserPrompt(lastMessage.content as string),
      })
      const intent = flatToIntent(object)
      if (!intent) {
        return {
          responseText: "Sorry, I didn't quite understand that! I can help you enroll Pokemon, schedule or cancel lessons, get recommendations, or show you our lesson catalog. What would you like to do?",
        }
      }
      return { intent }
    } catch (error) {
      const messageText = lastMessage.content as string
      const lessonType = extractLessonType(messageText)
      if (lessonType) {
        return { intent: { intent: 'list_lessons' as const, lesson_type: lessonType } }
      }
      return {
        responseText: "Sorry, I didn't quite understand that! I can help you enroll Pokemon, schedule or cancel lessons, get recommendations, or show you our lesson catalog. What would you like to do?",
      }
    }
  }
}
