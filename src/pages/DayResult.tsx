import { useMemo } from 'react'

import { DEFAULT_DAILY_GOAL_KCAL } from '../constants/goals'
import { useMealsStore } from '../stores/useMealsStore'
import { isMealOnLocalDay } from '../utils/date'

type DayResultProps = {
  onNewDay: () => void
}

function feedbackMessage(total: number): string {
  if (total < 1500) return 'Você ficou abaixo do objetivo hoje'
  if (total <= 2200) return 'Ótimo equilíbrio hoje!'
  return 'Você ultrapassou o objetivo hoje'
}

function feedbackTone(total: number): string {
  if (total < 1500)
    return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100'
  if (total <= 2200)
    return 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100'
  return 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100'
}

export function DayResult({ onNewDay }: DayResultProps) {
  const meals = useMealsStore((s) => s.meals)
  const clearMealsForLocalDay = useMealsStore((s) => s.clearMealsForLocalDay)

  const today = useMemo(() => new Date(), [])
  const todayMeals = useMemo(
    () => meals.filter((m) => isMealOnLocalDay(m, today)),
    [meals, today],
  )

  const total = useMemo(
    () => todayMeals.reduce((sum, m) => sum + m.calories, 0),
    [todayMeals],
  )

  const totalProtein = useMemo(
    () => todayMeals.reduce((sum, m) => sum + (m.protein ?? 0), 0),
    [todayMeals],
  )
  
  const totalCarbs = useMemo(
    () => todayMeals.reduce((sum, m) => sum + (m.carbs ?? 0), 0),
    [todayMeals],
  )
  
  const totalFat = useMemo(
    () => todayMeals.reduce((sum, m) => sum + (m.fat ?? 0), 0),
    [todayMeals],
  )

  const goal = DEFAULT_DAILY_GOAL_KCAL
  const rawPercent = goal > 0 ? (total / goal) * 100 : 0
  const barWidthPercent = Math.min(100, rawPercent)
  const overGoal = total > goal

  const handleNewDay = () => {
    clearMealsForLocalDay(today)
    onNewDay()
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-8 pb-10">
      <header>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resumo do dia</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Resultado
        </h1>
      </header>

      <section
        className={`rounded-2xl border p-4 ${feedbackTone(total)}`}
        aria-live="polite"
      >
        <p className="text-center text-sm font-medium leading-relaxed">{feedbackMessage(total)}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Total consumido
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
          {total}
          <span className="ml-1.5 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            kcal
          </span>
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Meta do dia: <span className="font-semibold text-slate-800 dark:text-slate-200">{goal} kcal</span>
        </p>

        <div className="mt-3 flex gap-4 text-sm">
  <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
    <span className="text-xs text-slate-500 dark:text-slate-400">Proteína</span>
    <span className="font-bold tabular-nums text-blue-600 dark:text-blue-400">
      {Math.round(totalProtein)}g
    </span>
  </div>
  <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
    <span className="text-xs text-slate-500 dark:text-slate-400">Carbo</span>
    <span className="font-bold tabular-nums text-amber-600 dark:text-amber-400">
      {Math.round(totalCarbs)}g
    </span>
  </div>
  <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
    <span className="text-xs text-slate-500 dark:text-slate-400">Gordura</span>
    <span className="font-bold tabular-nums text-rose-600 dark:text-rose-400">
      {Math.round(totalFat)}g
    </span>
  </div>
</div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Progresso em relação à meta</span>
            <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
              {Math.round(rawPercent)}%
            </span>
          </div>
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
            role="img"
            aria-label={`${Math.round(rawPercent)} por cento da meta diária`}
          >
            <div
              className={`h-full rounded-full transition-all ${
                overGoal
                  ? 'bg-rose-500 dark:bg-rose-500'
                  : 'bg-emerald-500 dark:bg-emerald-400'
              }`}
              style={{ width: `${barWidthPercent}%` }}
            />
          </div>
        </div>
      </section>

      <section aria-label="Refeições do dia">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          Refeições ({todayMeals.length})
        </h2>
        {todayMeals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
            Nenhuma refeição registrada hoje.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todayMeals.map((meal) => (
              <li
                key={meal.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {meal.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {meal.quantityLabel ?? '—'}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {meal.calories} kcal
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={handleNewDay}
          className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          Novo dia
        </button>
      </div>
    </div>
  )
}
