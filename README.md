# Pokemon Training Center Scheduler

An AI-powered scheduling assistant for a Pokemon Training Center. Trainers interact with a chatbot that understands natural language, classifies intents, and manages lesson enrollments, bookings, cancellations, and recommendations — all orchestrated through a LangGraph state machine and powered by LLMs via OpenRouter.

[Watch the demo](https://drive.google.com/file/d/1_SE-v1x9aM1Sc9r6wTxj1P7zxxmDfgkn/view?usp=sharing)

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [AI & LLM Pipeline](#ai--llm-pipeline)
  - [OpenRouter Integration](#openrouter-integration)
  - [Intent Classification](#intent-classification)
  - [LangGraph Orchestration](#langgraph-orchestration)
  - [Intent Flow](#intent-flow)
  - [Message Generation](#message-generation)
  - [Keyword Fallback](#keyword-fallback)
- [Backend](#backend)
- [Frontend](#frontend)
- [Database](#database)
- [PokeAPI Integration](#pokeapi-integration)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Tech Stack](#tech-stack)

## Architecture Overview

```
┌────────────────────┐         ┌─────────────────────────────────────────────┐
│   Next.js Frontend │ ──────> │             Fastify Backend                 │
│   (port 3001)      │ <────── │             (port 3000)                     │
│                    │         │                                             │
│  - Chat widget     │  POST   │  POST /chat ──> LangGraph State Machine    │
│  - Lesson catalog  │  /chat  │  GET /lessons                              │
│  - Trainer gallery │         │  GET /trainers                             │
│  - Pokemon cards   │         │  GET /health                               │
└────────────────────┘         └──────────┬──────────────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
            ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
            │  OpenRouter   │    │  SQLite (Prisma) │    │   PokeAPI    │
            │  (LLM calls)  │    │  dev.db          │    │  (species    │
            │               │    │                  │    │   validation)│
            └──────────────┘    └─────────────────┘    └──────────────┘
```

The system is split into two processes: a **Fastify backend** that hosts the AI pipeline and REST API, and a **Next.js frontend** that renders the chat UI and data pages. All AI reasoning happens server-side — the frontend simply sends messages and renders responses.

## AI & LLM Pipeline

The AI layer is the core of this project. Every user message passes through a multi-stage LLM pipeline built on **LangGraph**, **Vercel AI SDK**, and **OpenRouter**.

### OpenRouter Integration

OpenRouter acts as a unified gateway to hundreds of LLMs. Instead of being locked into a single provider, the app routes all LLM calls through OpenRouter, which means you can swap models by changing a single environment variable.

```typescript
// src/lib/ai/client.ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: { 'X-Title': 'Pokemon Training Center' },
})

const model = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free'
export const chatModel = openrouter(model)
```

The default model is **Meta Llama 3.3 70B Instruct** on the free tier, but any OpenRouter-compatible model works — GPT-4o, Claude, Gemini, Mistral, DeepSeek, etc. The `@openrouter/ai-sdk-provider` package plugs directly into the Vercel AI SDK, so the rest of the code is model-agnostic.

**Why OpenRouter?**
- Switch between models without code changes (just update `OPENROUTER_MODEL`)
- Access free-tier models for development
- Unified API across dozens of providers
- Built-in fallback and load balancing

### Intent Classification

The first LLM call in every request is **structured intent extraction**. Instead of free-form text generation, the AI SDK's `generateObject()` forces the LLM to output a JSON object that conforms to a Zod schema:

```typescript
// src/nodes/identifyIntent.ts
const { object } = await generateObject({
  model,
  schema: FlatIntentSchema,
  system: getIntentSystemPrompt(),
  prompt: getIntentUserPrompt(lastMessage.content),
})
```

The system prompt provides the LLM with:
- All 18 lesson categories and their Pokemon type requirements
- Definitions for each of the 7 intents with extraction rules
- Date/time conversion guidance (natural language to ISO 8601)
- Rules for disambiguating nicknames vs species names

The LLM must classify every message into one of these intents:

| Intent | Description | Extracted Fields |
|--------|-------------|-----------------|
| `enroll_pokemon` | Register a new Pokemon | `species`, `nickname?` |
| `schedule_lesson` | Book a training session | `pokemon_nickname`, `pokemon_species?`, `lesson_type`, `datetime` |
| `cancel_lesson` | Cancel an existing booking | `pokemon_nickname`, `pokemon_species?`, `datetime` |
| `recommend_lesson` | Get lesson recommendations | `pokemon_nickname`, `pokemon_species?` |
| `list_lessons` | Browse available lessons | `lesson_type?` |
| `view_schedule` | See a Pokemon's booked lessons | `pokemon_nickname`, `pokemon_species?` |
| `unknown` | Unrecognizable or off-topic | — |

The schema uses a discriminated union with nullable fields (via `FlatIntentSchema`) to maximize compatibility across different LLM providers, since not all models handle complex union types well with structured output.

### LangGraph Orchestration

The entire conversation flow is modeled as a **LangGraph StateGraph** — a directed graph where each node is a function that reads and writes to shared state.

```
                         ┌─────────────────────┐
                         │       START          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   identifyIntent     │
                         │   (LLM: generateObject)│
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────────┐
                    │    Conditional routing by intent   │
                    │                                    │
         ┌─────────┼─────────┬──────────┬───────────┐   │
         ▼         ▼         ▼          ▼           ▼   ▼
     ┌────────┐┌────────┐┌────────┐┌──────────┐┌────────┐┌─────────────┐
     │ enroll ││schedule││ cancel ││recommend ││listLess.││viewSchedule │
     └───┬────┘└───┬────┘└───┬────┘└────┬─────┘└───┬────┘└──────┬──────┘
         │         │         │          │          │             │
         └─────────┴─────────┴──────────┴──────────┴─────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      message         │
                         │  (LLM: generateText) │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │        END           │
                         └─────────────────────┘
```

**Graph state** flows through the pipeline as a single typed object:

```typescript
// src/graph/state.ts
GraphState {
  messages:     BaseMessage[]     // Conversation history
  intent?:      Intent            // Classified intent with extracted params
  actionResult?: ActionResult     // { success, message, data }
  responseText?: string           // Final natural-language response
  error?:       string            // Error context
}
```

Each action node is a pure function: it reads `state.intent`, calls the `TrainingService` with the extracted parameters, and returns an `actionResult`. No node knows about the others — the graph handles all routing.

### Intent Flow

Here's what happens end-to-end when a user sends a message:

**1. User sends:** `"Enroll my squirtle, call him Bubbles"`

**2. identifyIntent node** — LLM extracts:
```json
{ "intent": "enroll_pokemon", "species": "squirtle", "nickname": "Bubbles" }
```

**3. Graph routes to `enroll` node** — which:
- Validates "squirtle" against PokeAPI (fetches types, sprite, Pokedex ID)
- Checks no duplicate "Bubbles" exists for squirtle
- Creates a `PokemonStudent` record in the database

**4. `enroll` returns:**
```json
{
  "success": true,
  "message": "Bubbles the squirtle has been enrolled! Types: water.",
  "data": { "id": 1, "species": "squirtle", "nickname": "Bubbles", ... }
}
```

**5. message node** — LLM generates a friendly response:
> "Welcome aboard, Bubbles! Your squirtle is now officially enrolled at the Training Center. As a water type, Bubbles is eligible for Swim Training — ready to make a splash?"

**6. Response returned** to the frontend with the text, intent, and data (used for rendering Pokemon cards, badges, etc).

### Message Generation

The second LLM call transforms structured `ActionResult` data into natural language. The message generator receives both the classified intent and the action result as JSON:

```typescript
// src/nodes/messageGenerator.ts
const { text } = await generateText({
  model,
  system: getMessageSystemPrompt(),  // Persona + formatting rules
  prompt: getMessageUserPrompt(state.intent, actionResult),
})
```

The system prompt defines a "friendly Pokemon Training Center receptionist" persona with rules:
- Be enthusiastic but concise
- Use Pokemon-themed language
- When listing lessons, include all details (descriptions, instructor info, sprite URLs)
- Never hallucinate data — only reference what's in the action result

If the LLM call fails, the system falls back to the raw `actionResult.message` string, ensuring the user always gets a response.

### Keyword Fallback

If the LLM intent classification fails (network error, malformed output, rate limiting), the system doesn't give up. A hardcoded keyword matcher acts as a safety net:

```typescript
const LESSON_KEYWORDS = {
  swim: 'Swim Training', water: 'Swim Training',
  fire: 'Fire Control',  flame: 'Fire Control',
  dragon: 'Dragon Mastery', lance: 'Dragon Mastery',
  // ... 40+ keyword → lesson category mappings
}
```

This catches messages like "tell me about swim lessons" even when the LLM is unavailable, routing them to the `listLessons` node with the correct category.

## Backend

**Framework:** Fastify 5
**Runtime:** Node.js 24 (native TypeScript execution, no build step)

### API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/chat` | Main AI chat — accepts `{ message }`, returns `{ response, intent, data }` |
| `GET` | `/lessons` | Lists all 18 lesson categories with instructors |
| `GET` | `/trainers` | Lists all instructors with specialties |
| `GET` | `/health` | Health check |

### TrainingService

All business logic lives in `src/services/training.ts`. Key methods:

- **`enrollPokemon(species, nickname)`** — Validates species via PokeAPI, checks duplicates, creates student
- **`schedulePokemon(nickname, lessonType, datetime)`** — Validates type eligibility, finds closest available lesson, prevents double-booking
- **`cancelBooking(nickname, datetime)`** — Soft-deletes booking (status → "canceled")
- **`getRecommendations(nickname)`** — Filters 18 lesson categories by Pokemon type compatibility
- **`getLessonInfo(lessonType?)`** — Returns lesson details with instructor info and session availability
- **`getSchedule(nickname)`** — Returns a Pokemon's active bookings sorted by date

## Frontend

**Framework:** Next.js 16 with React 19 and Tailwind CSS 4

### Pages

- **`/`** — Landing page with featured lessons, trainers, and a "how it works" section
- **`/chat`** — Full-screen dedicated chat interface
- **`/lessons`** — Lesson catalog with type-based filtering (18 Pokemon types as filter badges)
- **`/trainers`** — Instructor gallery with sprites and specialties

### Chat System

The chat widget (`ChatWidget.tsx`) supports two modes:
- **Floating** — A pokeball button in the corner expands to a compact chat window
- **Full page** — Dedicated `/chat` route with full-height interface

Messages are rendered by `ChatMessage.tsx`, which inspects the response `data` shape and renders rich cards:
- **Pokemon banner** — Sprite + nickname + type badges (on enrollment)
- **Instructor banner** — Trainer sprite + lesson category + available sessions
- **Lesson grid** — 2-3 column card grid for browsing all categories
- **Schedule view** — Pokemon sprite + list of upcoming booked lessons
- **Recommendation card** — Pokemon + eligible lesson categories

Type badges are color-coded using a static map of 18 Pokemon type colors (`web/src/lib/pokemon-types.ts`).

## Database

**Engine:** SQLite via Prisma ORM

```
PokemonStudent ──< Booking >── Lesson ──> LessonCategory
                                  │
                                  └──> Instructor
```

- **PokemonStudent** — Enrolled Pokemon with species, nickname, types, and PokeAPI sprite
- **LessonCategory** — 18 categories (one per Pokemon type), each with allowed types
- **Instructor** — 15 gym leaders/trainers (Misty, Blaine, Bruno, Lance, etc.) with Pokemon Showdown sprites
- **Lesson** — Concrete session with datetime, capacity (default 3), linked to category + instructor
- **Booking** — Join between student and lesson, with status ("booked" / "canceled")

The seed script (`prisma/seed.ts`) populates all 18 categories, 15 instructors, and 2 sessions per category.

## PokeAPI Integration

The app validates Pokemon species against the public [PokeAPI](https://pokeapi.co/) before enrollment:

```typescript
// src/services/pokeapi.ts
// GET https://pokeapi.co/api/v2/pokemon/{name}
// Returns: { id, name, types[], spriteUrl }
```

Results are cached in-memory to avoid repeated API calls for the same species. This ensures only real Pokemon can be enrolled, and their types and sprites are always accurate.

## Getting Started

### Prerequisites

- Node.js 24+
- An [OpenRouter API key](https://openrouter.ai/keys) (free tier works)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd pokemon-training-center-scheduler

# Install backend dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Initialize database
npx prisma generate
npm run seed

# Start backend (port 3000)
npm run dev
```

```bash
# In a second terminal — start frontend (port 3001)
cd web
npm install
npm run dev
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | — | Your OpenRouter API key |
| `OPENROUTER_MODEL` | No | `meta-llama/llama-3.3-70b-instruct:free` | Any OpenRouter model ID |
| `DATABASE_URL` | No | `file:./dev.db` | SQLite database path |
| `PORT` | No | `3000` | Backend server port |
| `LANGSMITH_API_KEY` | No | — | LangSmith tracing key |
| `LANGSMITH_TRACING` | No | — | Enable LangSmith tracing (`true`) |
| `LANGSMITH_PROJECT` | No | — | LangSmith project name |

### Switching Models

Change the model by updating `OPENROUTER_MODEL` in `.env`:

```bash
# Free tier
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Or use any OpenRouter model
OPENROUTER_MODEL=openai/gpt-4o
OPENROUTER_MODEL=anthropic/claude-sonnet-4
OPENROUTER_MODEL=google/gemini-2.5-flash
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324
```

## Testing

```bash
# Unit tests — TrainingService (enrollment, scheduling, cancellation, recommendations)
npm test

# E2E tests — Full LangGraph pipeline (requires OPENROUTER_API_KEY)
npm run test:e2e
```

Tests use Node.js built-in test runner (`node:test`). Unit tests hit a real SQLite database and clean up after themselves.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Orchestration | LangGraph (StateGraph) |
| LLM Gateway | OpenRouter |
| AI SDK | Vercel AI SDK (`generateObject`, `generateText`) |
| Schema Validation | Zod 4 |
| Backend | Fastify 5, Node.js 24 (native TS) |
| Database | SQLite + Prisma 6 |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| External API | PokeAPI v2 |
| Observability | LangSmith (optional) |
