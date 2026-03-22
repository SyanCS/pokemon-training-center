import { z } from 'zod/v3'
import { withLangGraph } from '@langchain/langgraph/zod'
import { MessagesZodMeta } from '@langchain/langgraph'
import type { BaseMessage } from '@langchain/core/messages'
import type { Intent } from '../schemas/intent.ts'
import type { ActionResult } from '../services/training.ts'

export const GraphStateSchema = z.object({
  messages: withLangGraph(z.custom<BaseMessage[]>(), MessagesZodMeta),
  intent: z.custom<Intent>().optional(),
  actionResult: z.custom<ActionResult>().optional(),
  responseText: z.string().optional(),
  error: z.string().optional(),
})

export type GraphState = z.infer<typeof GraphStateSchema>
