import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'

import { searchFoods } from '../../services/usda'
import type { FoodSearchHit } from '../../types/food'
import { PortionModal } from './PortionModal'

const SEARCH_DEBOUNCE_MS = 300

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError'
}

export function FoodSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodSearchHit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [selected, setSelected] = useState<FoodSearchHit | null>(null)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const reqSeqRef = useRef(0)

  const clearDebounce = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  const performSearch = useCallback(async (rawQuery: string) => {
    const trimmedQuery = rawQuery.trim()

    if (!trimmedQuery) {
      abortRef.current?.abort()
      abortRef.current = null
      reqSeqRef.current += 1
      setResults([])
      setError(null)
      setIsLoading(false)
      setHasSearched(false)
      return
    }

    const seq = (reqSeqRef.current += 1)

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setResults([])
    setError(null)
    setIsLoading(true)

    try {
      const hits = await searchFoods(trimmedQuery, {
        signal: ac.signal,
        onSettled: () => {
          if (seq === reqSeqRef.current) setIsLoading(false)
        },
      })
      if (seq !== reqSeqRef.current) return
      setResults(hits)
      setHasSearched(true)
    } catch (e) {
      if (seq !== reqSeqRef.current) return
      if (isAbortError(e)) return
      setError('Não foi possível buscar. Tente de novo.')
      setResults([])
      setHasSearched(true)
    }
  }, [])

  useEffect(
    () => () => {
      clearDebounce()
      abortRef.current?.abort()
    },
    [clearDebounce],
  )

  const scheduleDebouncedSearch = useCallback(
    (value: string) => {
      clearDebounce()
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null
        void performSearch(value)
      }, SEARCH_DEBOUNCE_MS)
    },
    [clearDebounce, performSearch],
  )

  const onInputChange = (value: string) => {
    setQuery(value)
    scheduleDebouncedSearch(value)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    clearDebounce()
    void performSearch(query)
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <label htmlFor="food-search" className="sr-only">
          Buscar alimentos
        </label>
        <input
          id="food-search"
          type="search"
          value={query}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Buscar alimentos…"
          className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="min-h-11 shrink-0 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          {isLoading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul
          className="flex max-h-[min(50vh,24rem)] flex-col gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          aria-label="Resultados da busca"
        >
          {results.map((hit) => (
            <li
              key={hit.code}
              className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 dark:text-slate-50">{hit.productName}</p>
                {hit.brand ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{hit.brand}</p>
                ) : null}
                <div className="mt-1 space-y-0.5 text-sm tabular-nums text-slate-600 dark:text-slate-300">
  {hit.kcalPer100g != null ? (
    <p>
      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
        {Math.round(hit.kcalPer100g)}
      </span>{' '}
      kcal / 100 g
    </p>
  ) : (
    <p className="text-slate-400 dark:text-slate-500">kcal / 100 g indisponível</p>
  )}
  {(hit.proteinPer100g != null || hit.carbsPer100g != null || hit.fatPer100g != null) && (
    <p className="text-xs text-slate-500 dark:text-slate-400">
      {hit.proteinPer100g != null && <>P: <span className="font-semibold">{hit.proteinPer100g}g</span></>}
      {hit.carbsPer100g != null && <> · C: <span className="font-semibold">{hit.carbsPer100g}g</span></>}
      {hit.fatPer100g != null && <> · G: <span className="font-semibold">{hit.fatPer100g}g</span></>}
    </p>
  )}
</div>
              </div>
              <button
                type="button"
                disabled={hit.kcalPer100g == null}
                onClick={() => setSelected(hit)}
                className="shrink-0 rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/50 dark:disabled:border-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
              >
                Adicionar
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!isLoading && hasSearched && query.trim() && results.length === 0 && !error ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">Nenhum resultado.</p>
      ) : null}

      <PortionModal hit={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
