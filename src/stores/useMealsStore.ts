import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { MealEntry } from '../types/meal'
import { isMealOnLocalDay } from '../utils/date'

type MealsState = {
  meals: MealEntry[]
  addMeal: (meal: Omit<MealEntry, 'id' | 'recordedAt'> & { recordedAt?: string }) => void
  removeMeal: (id: string) => void
  /** Remove todas as refeições registradas no dia local indicado (ex.: hoje). */
  clearMealsForLocalDay: (day: Date) => void
}

function newMeal(
  partial: Omit<MealEntry, 'id' | 'recordedAt'> & { recordedAt?: string },
): MealEntry {
  return {
    id: crypto.randomUUID(),
    recordedAt: partial.recordedAt ?? new Date().toISOString(),
    name: partial.name,
    calories: partial.calories,
    protein: partial.protein ?? null,
    carbs: partial.carbs ?? null,
    fat: partial.fat ?? null,
    quantityLabel: partial.quantityLabel,
  }
}

export const useMealsStore = create<MealsState>()(
  persist(
    (set) => ({
      meals: [],
      addMeal: (partial) =>
        set((s) => ({ meals: [...s.meals, newMeal(partial)] })),
      removeMeal: (id) =>
        set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),
      clearMealsForLocalDay: (day) =>
        set((s) => ({
          meals: s.meals.filter((m) => !isMealOnLocalDay(m, day)),
        })),
    }),
    { name: 'calories-counter-meals' },
  ),
)
