import { useMemo, useState } from 'react'

import { FoodSearch } from './components/food/FoodSearch'
import { MealCard } from './components/meals/MealCard'
import { DayResult } from './pages/DayResult'
import { useMealsStore } from './stores/useMealsStore'
import { isMealOnLocalDay } from './utils/date'

type Page = 'home' | 'dayResult'

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
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {todayTotalKcal} kcal
            </span>
          </p>
        </div>

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
