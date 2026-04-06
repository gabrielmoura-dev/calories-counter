import type { FoodSearchHit } from '../types/food'

import { fetchOpenFoodFactsSearch } from './openFoodFacts'

const NUTRITIONIX_INSTANT_URL = 'https://trackapi.nutritionix.com/v2/search/instant'

export type SearchFoodsOptions = {
  onSettled?: () => void
  signal?: AbortSignal
}

type NixBranded = {
  nix_item_id?: string
  food_name?: string
  brand_name_item_name?: string
  brand_name?: string
  nf_calories?: number
  serving_qty?: number
  serving_unit?: string
  serving_weight_grams?: number
}

type NixCommon = {
  tag_id?: string
  food_name?: string
}

type NixInstantResponse = {
  branded?: NixBranded[]
  common?: NixCommon[]
}

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError'
}

/** Liga timeout de 8s ao abort do pai (qualquer um aborta o fetch). */
function createTimeoutLinkedController(parentSignal: AbortSignal | undefined, ms: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)

  const onParentAbort = () => {
    clearTimeout(timeout)
    controller.abort()
  }

  if (parentSignal) {
    if (parentSignal.aborted) {
      clearTimeout(timeout)
      controller.abort()
    } else {
      parentSignal.addEventListener('abort', onParentAbort, { once: true })
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeout)
      parentSignal?.removeEventListener('abort', onParentAbort)
    },
  }
}

function kcalPer100gFromBranded(b: NixBranded): number | null {
  const cal = b.nf_calories
  if (cal == null || !Number.isFinite(cal) || cal < 0) return null

  const wGrams = b.serving_weight_grams
  if (wGrams != null && wGrams > 0) {
    return Math.round((cal / wGrams) * 100)
  }

  const qty = Number(b.serving_qty)
  if (!Number.isFinite(qty) || qty <= 0) return null

  const unit = (b.serving_unit ?? '').toLowerCase().trim()

  if (unit === 'g' || unit === 'gram' || unit === 'grams') {
    return Math.round((cal / qty) * 100)
  }
  if (unit === 'oz' || unit === 'ounce' || unit === 'ounces') {
    const grams = qty * 28.349523125
    return Math.round((cal / grams) * 100)
  }

  return null
}

function mapBranded(b: NixBranded): FoodSearchHit | null {
  const id = (b.nix_item_id ?? '').trim()
  if (!id) return null
  const name = (b.food_name ?? b.brand_name_item_name ?? '').trim()
  if (!name) return null
  return {
    code: `nix-brand:${id}`,
    productName: name,
    brand: (b.brand_name ?? '').trim(),
    kcalPer100g: kcalPer100gFromBranded(b),
  }
}

function mapCommon(c: NixCommon): FoodSearchHit | null {
  const id = (c.tag_id ?? '').trim()
  if (!id) return null
  const name = (c.food_name ?? '').trim()
  if (!name) return null
  return {
    code: `nix-common:${id}`,
    productName: name,
    brand: '',
    /** Instant não traz calorias para common; usuário pode usar fallback OFF ou item branded */
    kcalPer100g: null,
  }
}

async function fetchNutritionixInstant(
  query: string,
  appId: string,
  appKey: string,
  signal: AbortSignal,
): Promise<FoodSearchHit[]> {
  const params = new URLSearchParams({
    query: query.trim(),
    branded: 'true',
    common: 'true',
  })

  const res = await fetch(`${NUTRITIONIX_INSTANT_URL}?${params.toString()}`, {
    signal,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-app-id': appId,
      'x-app-key': appKey,
    },
  })

  if (!res.ok) {
    throw new Error(`Nutritionix search failed: ${res.status}`)
  }

  const data = (await res.json()) as NixInstantResponse
  const seen = new Set<string>()
  const hits: FoodSearchHit[] = []

  for (const b of data.branded ?? []) {
    const hit = mapBranded(b)
    if (hit && !seen.has(hit.code)) {
      seen.add(hit.code)
      hits.push(hit)
    }
  }
  for (const c of data.common ?? []) {
    const hit = mapCommon(c)
    if (hit && !seen.has(hit.code)) {
      seen.add(hit.code)
      hits.push(hit)
    }
  }

  return hits
}

/**
 * Busca primária Nutritionix (branded + common); em falha, Open Food Facts.
 */
export async function searchFoods(query: string, options?: SearchFoodsOptions): Promise<FoodSearchHit[]> {
  const onSettled = options?.onSettled
  const parentSignal = options?.signal
  const trimmed = query.trim()

  if (!trimmed) {
    onSettled?.()
    return []
  }

  if (parentSignal?.aborted) {
    onSettled?.()
    throw new DOMException('Aborted', 'AbortError')
  }

  const appId = import.meta.env.VITE_NUTRITIONIX_APP_ID ?? ''
  const appKey = import.meta.env.VITE_NUTRITIONIX_APP_KEY ?? ''

  try {
    if (appId && appKey) {
      const nix = createTimeoutLinkedController(parentSignal, 8000)
      try {
        const hits = await fetchNutritionixInstant(trimmed, appId, appKey, nix.signal)
        return hits
      } catch (e) {
        if (isAbortError(e)) throw e
      } finally {
        nix.cleanup()
      }
    }

    const off = createTimeoutLinkedController(parentSignal, 8000)
    try {
      return await fetchOpenFoodFactsSearch(trimmed, off.signal)
    } finally {
      off.cleanup()
    }
  } finally {
    onSettled?.()
  }
}
