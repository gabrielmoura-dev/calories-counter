import { useEffect, useId, useMemo, useState } from 'react'

import { useMealsStore } from '../../stores/useMealsStore'
import type { FoodSearchHit } from '../../types/food'

// Chave do localStorage para salvar preferência de "usar itens" por produto
const ITEM_MODE_KEY = 'calories-counter-item-mode'

function loadItemModePrefs(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(ITEM_MODE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveItemModePref(code: string, value: boolean) {
  const prefs = loadItemModePrefs()
  prefs[code] = value
  localStorage.setItem(ITEM_MODE_KEY, JSON.stringify(prefs))
}

function getDefaultItemWeight(hit: FoodSearchHit): number | null {
  const name = hit.productName.toLowerCase()
  const unitOption = hit.servingOptions.find(o =>
    o.label.toLowerCase().includes('unidade') ||
    o.label.toLowerCase().includes('unit') ||
    o.label.toLowerCase().includes('large') ||
    o.label.toLowerCase().includes('medium') ||
    o.label.toLowerCase().includes('small') ||
    o.label.toLowerCase().includes('each') ||
    o.label.toLowerCase().includes('piece')
  )
  if (unitOption) return unitOption.grams
  if (name.includes('egg')) return 50
  if (name.includes('banana')) return 100
  if (name.includes('apple') || name.includes('maçã')) return 150
  if (name.includes('orange') || name.includes('laranja')) return 130
  if (name.includes('bread') || name.includes('pão') || name.includes('pao')) return 25
  if (name.includes('biscuit') || name.includes('biscoito')) return 10
  if (name.includes('chicken breast') || name.includes('peito de frango')) return 200
  return null
}

function isLiquid(hit: FoodSearchHit): boolean {
  const name = hit.productName.toLowerCase()
  return (
    name.includes('milk') || name.includes('juice') || name.includes('water') ||
    name.includes('leite') || name.includes('suco') || name.includes('água') ||
    name.includes('iogurte') || name.includes('yogurt') || name.includes('bebida') ||
    name.includes('drink') || name.includes('smoothie') || name.includes('shake')
  )
}

function mealDisplayName(hit: FoodSearchHit): string {
  return hit.brand ? `${hit.productName} (${hit.brand})` : hit.productName
}

type PortionModalProps = {
  hit: FoodSearchHit | null
  onClose: () => void
}

type PortionDialogBodyProps = {
  hit: FoodSearchHit
  kcalPer100: number
  onClose: () => void
}

function PortionDialogBody({ hit, kcalPer100, onClose }: PortionDialogBodyProps) {
  const addMeal = useMealsStore((s) => s.addMeal)
  const titleId = useId()
  const liquid = isLiquid(hit)
  const unit = liquid ? 'ml' : 'g'

  // preferência salva: usar modo itens?
  const savedPref = loadItemModePrefs()[hit.code]
  const defaultItemWeight = getDefaultItemWeight(hit)
  // se tem peso padrão, liga por padrão; senão respeita o que foi salvo
  const [useItems, setUseItems] = useState<boolean>(
    savedPref ?? defaultItemWeight != null
  )

  const [gramsStr, setGramsStr] = useState('100')
  const [itemsStr, setItemsStr] = useState('1')
  const [itemWeightStr, setItemWeightStr] = useState(
    String(defaultItemWeight ?? 100)
  )

  const grams = Number.parseFloat(gramsStr.replace(',', '.'))
  const items = Number.parseFloat(itemsStr.replace(',', '.'))
  const itemWeight = Number.parseFloat(itemWeightStr.replace(',', '.'))
  const gramsValid = Number.isFinite(grams) && grams > 0
  const itemWeightValid = Number.isFinite(itemWeight) && itemWeight > 0

  const onToggleUseItems = (checked: boolean) => {
    setUseItems(checked)
    saveItemModePref(hit.code, checked)
    // sincroniza gramas ao ativar itens
    if (checked && itemWeightValid) {
      const n = Number.parseFloat(itemsStr.replace(',', '.'))
      if (Number.isFinite(n) && n > 0) {
        setGramsStr(String(Math.round(n * itemWeight)))
      }
    }
  }

  const onItemsChange = (val: string) => {
    setItemsStr(val)
    const n = Number.parseFloat(val.replace(',', '.'))
    if (Number.isFinite(n) && n > 0 && itemWeightValid) {
      setGramsStr(String(Math.round(n * itemWeight)))
    }
  }

  const onItemWeightChange = (val: string) => {
    setItemWeightStr(val)
    const w = Number.parseFloat(val.replace(',', '.'))
    const n = Number.parseFloat(itemsStr.replace(',', '.'))
    if (Number.isFinite(w) && w > 0 && Number.isFinite(n) && n > 0) {
      setGramsStr(String(Math.round(n * w)))
    }
  }

  const onGramsChange = (val: string) => {
    setGramsStr(val)
    const g = Number.parseFloat(val.replace(',', '.'))
    if (Number.isFinite(g) && g > 0 && itemWeightValid) {
      setItemsStr(String(Math.round((g / itemWeight) * 10) / 10))
    }
  }

  const totalKcal = useMemo(() => {
    if (!gramsValid) return null
    return Math.round((kcalPer100 / 100) * grams)
  }, [kcalPer100, gramsValid, grams])

  const totalProtein = useMemo(() => {
    if (!gramsValid || hit.proteinPer100g == null) return null
    return Math.round((hit.proteinPer100g / 100) * grams * 10) / 10
  }, [hit.proteinPer100g, gramsValid, grams])

  const totalCarbs = useMemo(() => {
    if (!gramsValid || hit.carbsPer100g == null) return null
    return Math.round((hit.carbsPer100g / 100) * grams * 10) / 10
  }, [hit.carbsPer100g, gramsValid, grams])

  const totalFat = useMemo(() => {
    if (!gramsValid || hit.fatPer100g == null) return null
    return Math.round((hit.fatPer100g / 100) * grams * 10) / 10
  }, [hit.fatPer100g, gramsValid, grams])

  const confirm = () => {
    if (totalKcal == null || !gramsValid) return
    const qty = useItems && itemWeightValid
      ? `${items % 1 === 0 ? String(Math.round(items)) : items.toFixed(1)} item(s) · ${Math.round(grams)}${unit}`
      : `${Math.round(grams)}${unit}`
    addMeal({
      name: mealDisplayName(hit),
      calories: totalKcal,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      quantityLabel: qty,
    })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-white">
        Porção
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{mealDisplayName(hit)}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
        Base: {Math.round(kcalPer100)} kcal / 100{unit}
      </p>

      {/* Checkbox — usar quantidade por itens */}
      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={useItems}
          onChange={(e) => onToggleUseItems(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
        />
        Informar quantidade por itens
      </label>

      <div className="mt-3 flex flex-col gap-3">
        {/* Modo itens */}
        {useItems && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="portion-items" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Quantidade (itens)
              </label>
              <input
                id="portion-items"
                type="number"
                inputMode="decimal"
                min={0.1}
                step="any"
                value={itemsStr}
                onChange={(e) => onItemsChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 tabular-nums shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="portion-item-weight" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Peso por item ({unit})
              </label>
              <input
                id="portion-item-weight"
                type="number"
                inputMode="decimal"
                min={0.1}
                step="any"
                value={itemWeightStr}
                onChange={(e) => onItemWeightChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 tabular-nums shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>
        )}

        {/* Gramas — sempre visível, atualiza bidirecional com itens */}
        <div>
          <label htmlFor="portion-grams" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Quantidade em {liquid ? 'mililitros (ml)' : 'gramas (g)'}
            {useItems && (
              <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
                (calculado automaticamente)
              </span>
            )}
          </label>
          <input
            id="portion-grams"
            type="number"
            inputMode="decimal"
            min={0.1}
            step="any"
            value={gramsStr}
            onChange={(e) => onGramsChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 tabular-nums shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Totais */}
      <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
        <p>
          Total:{' '}
          <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {totalKcal != null ? `${totalKcal} kcal` : '—'}
          </span>
        </p>
        {totalProtein != null && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Proteína: <span className="font-semibold">{totalProtein}g</span>
            {totalCarbs != null && <> · Carbo: <span className="font-semibold">{totalCarbs}g</span></>}
            {totalFat != null && <> · Gordura: <span className="font-semibold">{totalFat}g</span></>}
          </p>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!gramsValid || totalKcal == null}
          onClick={confirm}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          Confirmar
        </button>
      </div>
    </div>
  )
}

export function PortionModal({ hit, onClose }: PortionModalProps) {
  useEffect(() => {
    if (!hit) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hit, onClose])

  const kcalPer100 = hit?.kcalPer100g ?? null
  if (!hit || kcalPer100 == null) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <PortionDialogBody key={hit.code} hit={hit} kcalPer100={kcalPer100} onClose={onClose} />
    </div>
  )
}