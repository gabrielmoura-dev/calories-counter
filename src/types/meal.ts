export type MealEntry = {
  id: string
  name: string
  /** kcal totais da refeição ou item */
  calories: number
  /** Proteína total em gramas */
  protein?: number | null
  /** Carboidratos total em gramas */
  carbs?: number | null
  /** Gordura total em gramas */
  fat?: number | null
  /** Ex.: "200 g" ou "1 fatia" */
  quantityLabel?: string
  /** ISO 8601 — quando foi registrado */
  recordedAt: string
}