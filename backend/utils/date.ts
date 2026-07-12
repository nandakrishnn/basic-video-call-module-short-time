export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60_000)
}

export const isPast = (date: Date): boolean => {
  return date.getTime() < Date.now()
}
