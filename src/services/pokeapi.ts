interface PokeApiResult {
  id: number
  name: string
  types: string[]
  spriteUrl: string | null
}

const cache = new Map<string, PokeApiResult>()

export async function getSpecies(name: string): Promise<PokeApiResult | null> {
  const key = name.toLowerCase().trim()

  if (cache.has(key)) return cache.get(key)!

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`)
    if (!res.ok) return null

    const data = await res.json()
    const result: PokeApiResult = {
      id: data.id,
      name: data.name,
      types: data.types.map((t: { type: { name: string } }) => t.type.name),
      spriteUrl: data.sprites?.front_default ?? null,
    }

    cache.set(key, result)
    return result
  } catch {
    return null
  }
}
