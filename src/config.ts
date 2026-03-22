const required = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

export const config = {
  openRouterApiKey: required('OPENROUTER_API_KEY'),
  openRouterModel: process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free',
  databaseUrl: required('DATABASE_URL'),
  port: parseInt(process.env.PORT ?? '3000', 10),
} as const
