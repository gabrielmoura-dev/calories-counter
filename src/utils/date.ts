export function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function isMealOnLocalDay(meal: { recordedAt: string }, day: Date): boolean {
  return startOfLocalDay(new Date(meal.recordedAt)) === startOfLocalDay(day)
}
