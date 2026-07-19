export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60_000)
}

export const isPast = (date: Date): boolean => {
  return date.getTime() < Date.now()
}

// Postgres `timestamp` (no time zone) columns strip the offset on round-trip, so a
// value written as UTC comes back with no 'Z' — `new Date(...)` on that string is
// parsed as LOCAL time, silently shifting it by the server's UTC offset. Every
// timestamp read back from this schema's plain `timestamp` columns must go through
// this before comparison.
export const parseUtc = (isoLike: string): Date => {
  const hasZone = /Z$|[+-]\d{2}:?\d{2}$/.test(isoLike)
  return new Date(hasZone ? isoLike : `${isoLike}Z`)
}
