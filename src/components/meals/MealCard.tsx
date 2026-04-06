import type { MealEntry } from '../../types/meal'

type MealCardProps = {
  meal: MealEntry
  onRemove?: (id: string) => void
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 7h16M10 7V5a1 1 0 011-1h2a1 1 0 011 1v2m3 0v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7h10zM10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export function MealCard({ meal, onRemove }: MealCardProps) {
  const quantity = meal.quantityLabel?.trim() || '—'

  return (
    <article
      className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 shadow-sm dark:border-slate-700/90 dark:bg-slate-900"
      aria-labelledby={`meal-title-${meal.id}`}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3
              id={`meal-title-${meal.id}`}
              className="min-w-0 flex-1 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50"
            >
              {meal.name}
            </h3>
            <p className="shrink-0 pt-0.5 text-right text-sm font-bold tabular-nums leading-none text-emerald-600 dark:text-emerald-400">
              {meal.calories}
              <span className="ml-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                kcal
              </span>
            </p>
            {onRemove ? (
              <button
                type="button"
                onClick={() => onRemove(meal.id)}
                className="-mr-1 -mt-0.5 shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                aria-label="Remover refeição"
              >
                <TrashIcon />
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{quantity}</p>
          <p className="mt-0.5 text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
            {formatTime(meal.recordedAt)}
          </p>
        </div>
      </div>
    </article>
  )
}
