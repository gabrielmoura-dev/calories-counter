import type { FoodSearchHit, ServingOption } from '../types/food'
import { filterApiResults, searchLocalFoods } from './localFoods'

const USDA_SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search'

export type SearchFoodsOptions = {
  onSettled?: () => void
  signal?: AbortSignal
}

type UsdaFood = {
  fdcId: number
  description: string
  brandName?: string
  brandOwner?: string
  servingSize?: number
  servingSizeUnit?: string
  householdServingFullText?: string
  foodNutrients?: Array<{
    nutrientId?: number
    nutrientName?: string
    value?: number
  }>
  foodMeasures?: Array<{
    disseminationText?: string
    gramWeight?: number
  }>
}

type UsdaSearchResponse = {
  foods?: UsdaFood[]
}

// Dicionário PT/ES → EN para busca no USDA
const TRANSLATIONS: Record<string, string> = {
  // Proteínas
  frango: 'chicken', pfrango: 'chicken breast',
  'peito de frango': 'chicken breast',
  'coxa de frango': 'chicken thigh',
  carne: 'beef', 'carne moída': 'ground beef',
  bife: 'beef steak', patinho: 'beef',
  alcatra: 'sirloin', picanha: 'beef picanha',
  porco: 'pork', linguiça: 'sausage',
  peixe: 'fish', atum: 'tuna',
  salmão: 'salmon', sardinha: 'sardine',
  camarão: 'shrimp', ovo: 'egg',
  ovos: 'eggs', peru: 'turkey',
  // ES
  pollo: 'chicken', 'pechuga de pollo': 'chicken breast',
  huevo: 'egg', huevos: 'eggs',
  cerdo: 'pork', pescado: 'fish',
  atun: 'tuna', camaron: 'shrimp',
  // Carboidratos
  arroz: 'rice', 'arroz integral': 'brown rice',
  pão: 'bread', 'pao': 'bread',
  'pão integral': 'whole wheat bread',
  macarrão: 'pasta', massa: 'pasta',
  batata: 'potato', 'batata doce': 'sweet potato',
  aveia: 'oats', granola: 'granola',
  tapioca: 'tapioca', mandioca: 'cassava',
  milho: 'corn', feijão: 'beans',
  'feijao': 'beans', lentilha: 'lentils',
  grão: 'chickpeas', 'grao de bico': 'chickpeas',
  // ES
  pan: 'bread', papa: 'potato',
  frijol: 'beans', frijoles: 'beans',
  maiz: 'corn', avena: 'oats',
  // Laticínios
  leite: 'milk', 'leite integral': 'whole milk',
  queijo: 'cheese', iogurte: 'yogurt',
  manteiga: 'butter', requeijão: 'cream cheese',
  // ES
  leche: 'milk', queso: 'cheese',
  yogur: 'yogurt', mantequilla: 'butter',
  // Frutas
  banana: 'banana', maçã: 'apple',
  laranja: 'orange', uva: 'grape',
  morango: 'strawberry', abacate: 'avocado',
  manga: 'mango', melancia: 'watermelon',
  abacaxi: 'pineapple', mamão: 'papaya',
  limão: 'lemon', melão: 'melon',
  // ES
  manzana: 'apple', naranja: 'orange',
  fresa: 'strawberry', sandia: 'watermelon',
  pina: 'pineapple', limon: 'lemon',
  // Verduras
  alface: 'lettuce', tomate: 'tomato',
  cenoura: 'carrot', brócolis: 'broccoli',
  espinafre: 'spinach', cebola: 'onion',
  alho: 'garlic', pepino: 'cucumber',
  abobrinha: 'zucchini', couve: 'kale',
  // ES
  lechuga: 'lettuce', zanahoria: 'carrot',
  brocoli: 'broccoli', cebolla: 'onion',
  ajo: 'garlic',
  // Outros
  azeite: 'olive oil', óleo: 'oil',
  açúcar: 'sugar', mel: 'honey',
  'pasta de amendoim': 'peanut butter',
  amendoim: 'peanut', castanha: 'chestnut',
  'castanha de caju': 'cashew',
  chocolate: 'chocolate', café: 'coffee',
  suco: 'juice', refrigerante: 'soda',
  cerveja: 'beer', vinho: 'wine',
  // ES
  aceite: 'oil', azucar: 'sugar',
  miel: 'honey', mani: 'peanut',
  jugo: 'juice', refresco: 'soda',
}

function translateQuery(query: string): string {
  const lower = query.toLowerCase().trim()
  // tenta match exato primeiro
  if (TRANSLATIONS[lower]) return TRANSLATIONS[lower]
  // tenta match parcial por palavra
  for (const [pt, en] of Object.entries(TRANSLATIONS)) {
    if (lower.includes(pt)) return lower.replace(pt, en)
  }
  return lower
}

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError'
}

function createTimeoutLinkedController(parentSignal: AbortSignal | undefined, ms: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  const onParentAbort = () => { clearTimeout(timeout); controller.abort() }
  if (parentSignal) {
    if (parentSignal.aborted) { clearTimeout(timeout); controller.abort() }
    else { parentSignal.addEventListener('abort', onParentAbort, { once: true }) }
  }
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeout)
      parentSignal?.removeEventListener('abort', onParentAbort)
    },
  }
}

const KCAL_NUTRIENT_IDS = new Set([1008, 2047, 2048])
const PROTEIN_NUTRIENT_IDS = new Set([1003])
const CARBS_NUTRIENT_IDS = new Set([1005])
const FAT_NUTRIENT_IDS = new Set([1004])

function extractNutrient(food: UsdaFood, ids: Set<number>, nameParts: string[]): number | null {
  if (!food.foodNutrients?.length) return null
  for (const n of food.foodNutrients) {
    if (n.nutrientId != null && ids.has(n.nutrientId) && n.value != null && n.value >= 0) {
      return Math.round(n.value * 10) / 10
    }
    const name = (n.nutrientName ?? '').toLowerCase()
    if (nameParts.some(p => name.includes(p)) && n.value != null && n.value >= 0) {
      return Math.round(n.value * 10) / 10
    }
  }
  return null
}

function extractServingOptions(food: UsdaFood): ServingOption[] {
  const options: ServingOption[] = []
  const seen = new Set<string>()

  // porção declarada pelo fabricante
  if (food.servingSize != null && food.servingSize > 0) {
    const unit = (food.servingSizeUnit ?? '').toLowerCase()
    const grams = unit === 'g' || unit === 'gram' || unit === 'grams'
      ? food.servingSize
      : unit === 'ml' || unit === 'milliliter'
      ? food.servingSize // assume 1ml ≈ 1g para líquidos
      : null

    if (grams != null) {
      const label = food.householdServingFullText
        ? `${food.householdServingFullText} (${Math.round(grams)}g)`
        : `1 porção (${Math.round(grams)}g)`
      if (!seen.has(label)) { seen.add(label); options.push({ label, grams }) }
    }
  }

  // medidas caseiras do USDA
  for (const m of food.foodMeasures ?? []) {
    if (!m.disseminationText || !m.gramWeight || m.gramWeight <= 0) continue
    const label = `${m.disseminationText} (${Math.round(m.gramWeight)}g)`
    if (!seen.has(label)) { seen.add(label); options.push({ label, grams: m.gramWeight }) }
  }

  // fallbacks por nome do produto
  const name = food.description.toLowerCase()
  if (options.length === 0) {
    if (name.includes('egg')) options.push({ label: '1 unidade (50g)', grams: 50 })
    else if (name.includes('milk') || name.includes('leite')) options.push({ label: '1 copo (200ml)', grams: 200 })
    else if (name.includes('bread') || name.includes('pao') || name.includes('pão')) options.push({ label: '1 fatia (25g)', grams: 25 })
    else if (name.includes('banana')) options.push({ label: '1 unidade (100g)', grams: 100 })
    else if (name.includes('apple') || name.includes('maçã')) options.push({ label: '1 unidade (150g)', grams: 150 })
  }

  return options
}

function mapUsdaFood(food: UsdaFood): FoodSearchHit {
  return {
    code: `usda:${food.fdcId}`,
    productName: food.description ?? '',
    brand: food.brandName ?? food.brandOwner ?? '',
    kcalPer100g: extractNutrient(food, KCAL_NUTRIENT_IDS, ['energy', 'calories']),
    proteinPer100g: extractNutrient(food, PROTEIN_NUTRIENT_IDS, ['protein']),
    carbsPer100g: extractNutrient(food, CARBS_NUTRIENT_IDS, ['carbohydrate']),
    fatPer100g: extractNutrient(food, FAT_NUTRIENT_IDS, ['fat', 'lipid']),
    servingOptions: extractServingOptions(food),
  }
}

async function fetchUsdaSearch(query: string, apiKey: string, signal: AbortSignal): Promise<FoodSearchHit[]> {
  const translated = translateQuery(query)
  const params = new URLSearchParams({
    query: translated,
    api_key: apiKey,
    pageSize: '25',
    dataType: 'Branded,Foundation,SR Legacy',
    fields: 'fdcId,description,brandName,brandOwner,servingSize,servingSizeUnit,householdServingFullText,foodNutrients,foodMeasures',
  })
  const res = await fetch(`${USDA_SEARCH_URL}?${params.toString()}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`USDA search failed: ${res.status}`)
  const data = (await res.json()) as UsdaSearchResponse
  return (data.foods ?? []).map(mapUsdaFood)
}

export async function searchFoods(query: string, options?: SearchFoodsOptions): Promise<FoodSearchHit[]> {
  const onSettled = options?.onSettled
  const parentSignal = options?.signal
  const trimmed = query.trim().toLowerCase()

  if (!trimmed) { onSettled?.(); return [] }
  if (parentSignal?.aborted) { onSettled?.(); throw new DOMException('Aborted', 'AbortError') }

  const apiKey = import.meta.env.VITE_USDA_API_KEY ?? ''
  if (!apiKey) { onSettled?.(); throw new Error('VITE_USDA_API_KEY não configurada no .env') }

  const { signal, cleanup } = createTimeoutLinkedController(parentSignal, 8000)
  try {
    const [localResults, apiResults] = await Promise.all([
      Promise.resolve(searchLocalFoods(trimmed)),
      fetchUsdaSearch(trimmed, apiKey, signal),
    ])
    const filteredApi = filterApiResults(trimmed, apiResults)
    // locais primeiro, depois API sem duplicatas
    const localCodes = new Set(localResults.map(f => f.code))
    const merged = [
      ...localResults,
      ...filteredApi.filter(f => !localCodes.has(f.code)),
    ]
    return merged
  } catch (e) {
    if (isAbortError(e)) throw e
    throw e
  } finally {
    cleanup()
    onSettled?.()
  }
}