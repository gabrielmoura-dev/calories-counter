import type { FoodSearchHit } from '../types/food'

/**
 * Base da API REST v2 (uso futuro). Busca no browser usa apenas search.pl (CORS OK).
 */
export const OPEN_FOOD_FACTS_API_BASE = 'https://world.openfoodfacts.org/api/v2'

const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl'

type OffSearchProduct = {
  code?: string
  product_name?: string
  product_name_pt?: string
  brands?: string
  nutriments?: Record<string, number | string | undefined>
}

type OffSearchResponse = {
  products?: OffSearchProduct[]
}

function readKcalPer100g(nutriments: Record<string, number | string | undefined> | undefined): number | null {
  if (!nutriments) return null
  const raw =
    nutriments['energy-kcal_100g'] ??
    nutriments['energy_kcal_100g'] ??
    nutriments['energy-kcal'] ??
    nutriments['energy_kcal']
  if (raw === undefined || raw === '') return null
  const n = typeof raw === 'number' ? raw : Number.parseFloat(String(raw))
  return Number.isFinite(n) ? n : null
}

function pickDisplayName(p: OffSearchProduct): string {
  const pt = (p.product_name_pt ?? '').trim()
  if (pt) return pt
  return (p.product_name ?? '').trim()
}

function mapProduct(p: OffSearchProduct): FoodSearchHit | null {
  const name = pickDisplayName(p)
  if (!name) return null
  const code = String(p.code ?? '').trim()
  if (!code) return null
  const brand = (p.brands ?? '').trim()
  return {
    code,
    productName: name,
    brand,
    kcalPer100g: readKcalPer100g(p.nutriments),
    proteinPer100g: null,
    carbsPer100g: null,
    fatPer100g: null,
    servingOptions: [],
  }
}

/**
 * Busca Open Food Facts usando o sinal externo (timeout/abort vêm de quem chama).
 */
export async function fetchOpenFoodFactsSearch(query: string, signal: AbortSignal): Promise<FoodSearchHit[]> {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return []

  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  const params = new URLSearchParams({
    search_terms: normalizedQuery,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '24',
    fields: 'code,product_name,product_name_pt,brands,nutriments',
  })

  const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    signal,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'CaloriesCounter/1.0 (calorie-tracker-pwa)',
    },
  })

  if (!res.ok) {
    throw new Error(`Open Food Facts search failed: ${res.status}`)
  }

  const text = await res.text()
  let data: OffSearchResponse
  try {
    data = JSON.parse(text) as OffSearchResponse
  } catch {
    throw new Error('Open Food Facts returned invalid JSON')
  }

  const products = data.products ?? []
  const hits: FoodSearchHit[] = []
  for (const p of products) {
    const hit = mapProduct(p)
    if (hit) hits.push(hit)
  }
  return hits
}
