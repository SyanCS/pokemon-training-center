import { generateText } from 'ai'
import type { LanguageModelV1 } from 'ai'
import { getMessageSystemPrompt, getMessageUserPrompt } from '../prompts/messageGenerator.ts'
import type { GraphState } from '../graph/state.ts'

export function createMessageGeneratorNode(model: LanguageModelV1) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const actionResult = state.actionResult ?? { success: true, message: 'No action needed.' }

    try {
      const { text } = await generateText({
        model,
        system: getMessageSystemPrompt(),
        prompt: getMessageUserPrompt(state.intent!, actionResult),
      })
      return { responseText: text.replace(/^["']+|["']+$/g, '').trim(), actionResult }
    } catch (error) {
      // Fallback: use the action result message directly
      return { responseText: actionResult.message, actionResult }
    }
  }
}
