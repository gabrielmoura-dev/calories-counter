import type { FoodSearchHit } from '../types/food'

/**
 * Banco local de alimentos com dados confiáveis e padronizados.
 * Esses alimentos têm prioridade sobre a API do USDA na busca.
 * Valores por 100g, baseados em tabelas nutricionais brasileiras (TACO).
 */
const LOCAL_FOODS: FoodSearchHit[] = [
  // — Ovos —
  {
    code: 'local:ovo-inteiro',
    productName: 'Ovo de galinha inteiro',
    brand: 'TACO',
    kcalPer100g: 143,
    proteinPer100g: 12,    // ~6g por unidade de 50g
    carbsPer100g: 0.8,
    fatPer100g: 9.5,
    servingOptions: [{ label: '1 unidade (50g)', grams: 50 }],
  },
  {
    code: 'local:ovo-clara',
    productName: 'Clara de ovo',
    brand: 'TACO',
    kcalPer100g: 52,
    proteinPer100g: 11,
    carbsPer100g: 0.7,
    fatPer100g: 0.2,
    servingOptions: [{ label: '1 unidade (30g)', grams: 30 }],
  },
  {
    code: 'local:ovo-gema',
    productName: 'Gema de ovo',
    brand: 'TACO',
    kcalPer100g: 322,
    proteinPer100g: 15.9,
    carbsPer100g: 1,
    fatPer100g: 27.7,
    servingOptions: [{ label: '1 unidade (20g)', grams: 20 }],
  },

  // — Frango —
  {
    code: 'local:peito-frango-grelhado',
    productName: 'Peito de frango grelhado',
    brand: 'TACO',
    kcalPer100g: 159,
    proteinPer100g: 32,
    carbsPer100g: 0,
    fatPer100g: 3.2,
    servingOptions: [{ label: '1 filé médio (150g)', grams: 150 }],
  },
  {
    code: 'local:peito-frango-cru',
    productName: 'Peito de frango cru',
    brand: 'TACO',
    kcalPer100g: 119,
    proteinPer100g: 22.4,
    carbsPer100g: 0,
    fatPer100g: 2.7,
    servingOptions: [{ label: '1 filé médio (150g)', grams: 150 }],
  },
  {
    code: 'local:coxa-frango',
    productName: 'Coxa de frango grelhada',
    brand: 'TACO',
    kcalPer100g: 197,
    proteinPer100g: 26.7,
    carbsPer100g: 0,
    fatPer100g: 10,
    servingOptions: [{ label: '1 coxa (80g)', grams: 80 }],
  },

  // — Carnes —
  {
    code: 'local:carne-moida-patinho',
    productName: 'Carne moída (patinho)',
    brand: 'TACO',
    kcalPer100g: 219,
    proteinPer100g: 18.6,
    carbsPer100g: 0,
    fatPer100g: 16,
    servingOptions: [],
  },
  {
    code: 'local:bife-alcatra',
    productName: 'Bife de alcatra grelhado',
    brand: 'TACO',
    kcalPer100g: 225,
    proteinPer100g: 30.9,
    carbsPer100g: 0,
    fatPer100g: 11.3,
    servingOptions: [{ label: '1 bife médio (120g)', grams: 120 }],
  },

  // — Laticínios —
  {
    code: 'local:leite-integral',
    productName: 'Leite integral',
    brand: 'TACO',
    kcalPer100g: 61,
    proteinPer100g: 3.2,
    carbsPer100g: 4.7,
    fatPer100g: 3.2,
    servingOptions: [
      { label: '1 copo (200ml)', grams: 200 },
      { label: '1 xícara (240ml)', grams: 240 },
    ],
  },
  {
    code: 'local:leite-desnatado',
    productName: 'Leite desnatado',
    brand: 'TACO',
    kcalPer100g: 35,
    proteinPer100g: 3.4,
    carbsPer100g: 4.9,
    fatPer100g: 0.1,
    servingOptions: [
      { label: '1 copo (200ml)', grams: 200 },
      { label: '1 xícara (240ml)', grams: 240 },
    ],
  },
  {
    code: 'local:iogurte-natural',
    productName: 'Iogurte natural integral',
    brand: 'TACO',
    kcalPer100g: 66,
    proteinPer100g: 3.8,
    carbsPer100g: 5,
    fatPer100g: 3.1,
    servingOptions: [{ label: '1 pote (170g)', grams: 170 }],
  },

  // — Grãos e cereais —
  {
    code: 'local:arroz-branco-cozido',
    productName: 'Arroz branco cozido',
    brand: 'TACO',
    kcalPer100g: 128,
    proteinPer100g: 2.5,
    carbsPer100g: 28.1,
    fatPer100g: 0.2,
    servingOptions: [{ label: '1 colher de servir (80g)', grams: 80 }],
  },
  {
    code: 'local:arroz-integral-cozido',
    productName: 'Arroz integral cozido',
    brand: 'TACO',
    kcalPer100g: 124,
    proteinPer100g: 2.6,
    carbsPer100g: 25.8,
    fatPer100g: 1,
    servingOptions: [{ label: '1 colher de servir (80g)', grams: 80 }],
  },
  {
    code: 'local:feijao-cozido',
    productName: 'Feijão preto cozido',
    brand: 'TACO',
    kcalPer100g: 77,
    proteinPer100g: 4.5,
    carbsPer100g: 14,
    fatPer100g: 0.5,
    servingOptions: [{ label: '1 concha (80g)', grams: 80 }],
  },
  {
    code: 'local:aveia-flocos',
    productName: 'Aveia em flocos',
    brand: 'TACO',
    kcalPer100g: 394,
    proteinPer100g: 13.9,
    carbsPer100g: 67.9,
    fatPer100g: 8.5,
    servingOptions: [{ label: '1 colher de sopa (10g)', grams: 10 }],
  },

  // — Frutas —
  {
    code: 'local:banana',
    productName: 'Banana prata',
    brand: 'TACO',
    kcalPer100g: 98,
    proteinPer100g: 1.3,
    carbsPer100g: 26,
    fatPer100g: 0.1,
    servingOptions: [
      { label: '1 unidade pequena (80g)', grams: 80 },
      { label: '1 unidade média (100g)', grams: 100 },
    ],
  },
  {
    code: 'local:maca',
    productName: 'Maçã com casca',
    brand: 'TACO',
    kcalPer100g: 56,
    proteinPer100g: 0.3,
    carbsPer100g: 15.2,
    fatPer100g: 0.1,
    servingOptions: [{ label: '1 unidade média (150g)', grams: 150 }],
  },

  // — Outros —
  {
    code: 'local:azeite',
    productName: 'Azeite de oliva',
    brand: 'TACO',
    kcalPer100g: 884,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 100,
    servingOptions: [{ label: '1 colher de sopa (13ml)', grams: 13 }],
  },
  {
    code: 'local:pasta-amendoim',
    productName: 'Pasta de amendoim integral',
    brand: 'TACO',
    kcalPer100g: 598,
    proteinPer100g: 24.4,
    carbsPer100g: 20,
    fatPer100g: 47.7,
    servingOptions: [{ label: '1 colher de sopa (30g)', grams: 30 }],
  },
]

/**
 * Termos que identificam cada alimento local.
 * O match é feito por substring na query normalizada.
 */
const LOCAL_FOOD_TERMS: Array<{ terms: string[]; codes: string[] }> = [
  {
    terms: ['ovo', 'ovos', 'egg', 'eggs', 'huevo', 'huevos'],
    codes: ['local:ovo-inteiro', 'local:ovo-clara', 'local:ovo-gema'],
  },
  {
    terms: ['clara'],
    codes: ['local:ovo-clara'],
  },
  {
    terms: ['gema'],
    codes: ['local:ovo-gema'],
  },
  {
    terms: ['peito de frango', 'chicken breast', 'pechuga'],
    codes: ['local:peito-frango-grelhado', 'local:peito-frango-cru'],
  },
  {
    terms: ['coxa de frango', 'chicken thigh'],
    codes: ['local:coxa-frango'],
  },
  {
    terms: ['frango', 'chicken', 'pollo'],
    codes: ['local:peito-frango-grelhado', 'local:peito-frango-cru', 'local:coxa-frango'],
  },
  {
    terms: ['carne moída', 'carne moida', 'ground beef'],
    codes: ['local:carne-moida-patinho'],
  },
  {
    terms: ['alcatra', 'bife', 'sirloin', 'steak'],
    codes: ['local:bife-alcatra'],
  },
  {
    terms: ['leite integral', 'whole milk'],
    codes: ['local:leite-integral'],
  },
  {
    terms: ['leite desnatado', 'skim milk'],
    codes: ['local:leite-desnatado'],
  },
  {
    terms: ['leite', 'milk', 'leche'],
    codes: ['local:leite-integral', 'local:leite-desnatado'],
  },
  {
    terms: ['iogurte', 'yogurt', 'yogur'],
    codes: ['local:iogurte-natural'],
  },
  {
    terms: ['arroz integral', 'brown rice'],
    codes: ['local:arroz-integral-cozido'],
  },
  {
    terms: ['arroz', 'rice'],
    codes: ['local:arroz-branco-cozido', 'local:arroz-integral-cozido'],
  },
  {
    terms: ['feijão', 'feijao', 'beans', 'frijol'],
    codes: ['local:feijao-cozido'],
  },
  {
    terms: ['aveia', 'oats', 'avena'],
    codes: ['local:aveia-flocos'],
  },
  {
    terms: ['banana'],
    codes: ['local:banana'],
  },
  {
    terms: ['maçã', 'maca', 'apple'],
    codes: ['local:maca'],
  },
  {
    terms: ['azeite', 'olive oil'],
    codes: ['local:azeite'],
  },
  {
    terms: ['pasta de amendoim', 'peanut butter'],
    codes: ['local:pasta-amendoim'],
  },
]

const LOCAL_FOOD_MAP = new Map(LOCAL_FOODS.map(f => [f.code, f]))

/**
 * Retorna alimentos do banco local que batem com a query.
 * Retorna array vazio se nenhum bater.
 */
export function searchLocalFoods(query: string): FoodSearchHit[] {
  const lower = query.toLowerCase().trim()
  const matchedCodes = new Set<string>()

  for (const entry of LOCAL_FOOD_TERMS) {
    if (entry.terms.some(t => lower.includes(t))) {
      entry.codes.forEach(c => matchedCodes.add(c))
    }
  }

  return Array.from(matchedCodes)
    .map(code => LOCAL_FOOD_MAP.get(code))
    .filter((f): f is FoodSearchHit => f != null)
}

/**
 * Códigos locais que bloqueiam resultados equivalentes da API.
 * Se a query bater com esses termos, filtra os resultados da API.
 */
const BLOCKED_API_TERMS: Array<{ terms: string[]; apiFilter: (name: string) => boolean }> = [
  {
    // se buscar ovo/egg, remove resultados genéricos de egg da API
    terms: ['ovo', 'ovos', 'egg', 'eggs', 'huevo', 'huevos'],
    apiFilter: (name) => {
      const n = name.toLowerCase()
      // mantém produtos específicos como "egg white protein powder"
      // remove entradas genéricas de ovo
      return n === 'egg' || n === 'eggs' ||
        n.startsWith('egg, whole') || n.startsWith('eggs, whole') ||
        n === 'egg white' || n === 'egg yolk' ||
        n.startsWith('egg white,') || n.startsWith('egg yolk,')
    },
  },
]

/**
 * Filtra resultados da API removendo itens que o banco local já cobre melhor.
 */
export function filterApiResults(query: string, apiResults: FoodSearchHit[]): FoodSearchHit[] {
  const lower = query.toLowerCase().trim()
  let filtered = apiResults

  for (const block of BLOCKED_API_TERMS) {
    if (block.terms.some(t => lower.includes(t))) {
      filtered = filtered.filter(f => !block.apiFilter(f.productName))
    }
  }

  return filtered
}

