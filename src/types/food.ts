/** Unidade de porção alternativa (ex: 1 unidade = 50g) */
export type ServingOption = {
  label: string   // ex: "1 unidade", "1 xícara", "1 fatia"
  grams: number   // equivalente em gramas
}

/** Item retornado pela busca (USDA FoodData Central) */
export type FoodSearchHit = {
  code: string
  productName: string
  brand: string
  kcalPer100g: number | null
  proteinPer100g: number | null
  carbsPer100g: number | null
  fatPer100g: number | null
  /** Opções de porção alternativas além de gramas */
  servingOptions: ServingOption[]
}