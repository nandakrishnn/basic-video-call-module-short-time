// The backend's Postgres `timestamp` (no time zone) columns strip the offset on
// round-trip, so a value written as UTC comes back with no 'Z' (e.g.
// "2026-07-18T14:06:57.555"). `new Date(...)` on that string parses as LOCAL time,
// silently shifting it by the browser's UTC offset. Every timestamp from the API
// must go through this before use in a Date.
export const parseUtc = (isoLike: string): Date => {
  const hasZone = /Z$|[+-]\d{2}:?\d{2}$/.test(isoLike)
  return new Date(hasZone ? isoLike : `${isoLike}Z`)
}

export const isPast = (date: Date): boolean => date.getTime() < Date.now()
