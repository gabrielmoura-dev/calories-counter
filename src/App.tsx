import { useMemo, useState } from 'react'
import { FoodSearch } from './components/food/FoodSearch'
import { MealCard } from './components/meals/MealCard'
import { DayResult } from './pages/DayResult'
import { DEFAULT_DAILY_GOAL_KCAL } from './constants/goals'
import { useMealsStore } from './stores/useMealsStore'
import { isMealOnLocalDay } from './utils/date'

type Page = 'home' | 'dayResult'

function getProgressColor(percent: number): string {
  if (percent >= 100) return 'text-emerald-500 dark:text-emerald-400'
  if (percent >= 50) return 'text-orange-400 dark:text-orange-300'
  if (percent >= 26) return 'text-white dark:text-white'
  return 'text-red-400 dark:text-red-400'
}

function getProgressBarColor(percent: number): string {
  if (percent >= 100) return 'bg-emerald-500'
  if (percent >= 50) return 'bg-orange-400'
  if (percent >= 26) return 'bg-white'
  return 'bg-red-400'
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const meals = useMealsStore((s) => s.meals)
  const removeMeal = useMealsStore((s) => s.removeMeal)

  const todayMeals = useMemo(() => {
    const today = new Date()
    return meals.filter((m) => isMealOnLocalDay(m, today))
  }, [meals])

  const todayTotalKcal = useMemo(
    () => todayMeals.reduce((sum, m) => sum + m.calories, 0),
    [todayMeals],
  )

  const percent = Math.round((todayTotalKcal / DEFAULT_DAILY_GOAL_KCAL) * 100)
  const barWidth = Math.min(100, percent)
  const colorClass = getProgressColor(percent)
  const barColor = getProgressBarColor(percent)

  if (page === 'dayResult') {
    return <DayResult onNewDay={() => setPage('home')} />
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-8 pb-28">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Calories Counter
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          PWA — dados persistidos no dispositivo (localStorage).
        </p>
      </header>

      <FoodSearch />

      <section aria-label="Refeições de hoje">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Hoje</h2>
          <p className="text-sm tabular-nums text-slate-600 dark:text-slate-400">
            Total:{' '}
            <span className={`font-bold ${colorClass}`}>
              {todayTotalKcal} kcal
            </span>
          </p>
        </div>

        {/* Barra de progresso da meta diária */}
        {todayTotalKcal > 0 && (
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Progresso da meta diária</span>
              <span className={`font-semibold tabular-nums ${colorClass}`}>{percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        )}

        {todayMeals.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white/50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
            Nenhum item hoje. Busque um alimento e adicione com a porção desejada.
          </p>
        ) : (
          <ul className="flex flex-col gap-2 sm:gap-2.5">
            {todayMeals.map((meal) => (
              <li key={meal.id}>
                <MealCard meal={meal} onRemove={removeMeal} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-slate-50/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={() => setPage('dayResult')}
            className="w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Finalizar dia
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App