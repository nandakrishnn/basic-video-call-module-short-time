import { CONFIG } from '@/constants/config'
import type { Appointment } from '@/types/appointment.types'
import { isPast, parseUtc } from '@/utils/date'

const MINUTE_MS = 60_000

/** What a booking is actually in, once the clock is taken into account. */
export type DerivedStatus = 'scheduled' | 'missed' | 'completed' | 'cancelled'

export type BookingFilter = 'all' | 'upcoming' | 'missed' | 'completed' | 'cancelled'

/**
 * The stored status says nothing about time, so a booking still marked
 * "scheduled" after its slot has passed is really a missed one. Every surface
 * that shows a booking derives its status here so they can't disagree.
 */
export const deriveStatus = (appointment: Appointment): DerivedStatus => {
  if (appointment.status === 'scheduled' && isPast(parseUtc(appointment.scheduledAt))) return 'missed'
  return appointment.status
}

export const isUpcoming = (appointment: Appointment): boolean => deriveStatus(appointment) === 'scheduled'

/**
 * A call can still be started shortly after its slot — running late is normal —
 * but the window closes after CONFIG.session.joinGraceMinutesAfterStart. Past
 * that the booking should be rescheduled rather than joined, and a completed or
 * cancelled one is never joinable.
 */
export const canStartCall = (appointment: Appointment): boolean => {
  if (appointment.status !== 'scheduled') return false
  const graceEnd =
    parseUtc(appointment.scheduledAt).getTime() + CONFIG.session.joinGraceMinutesAfterStart * MINUTE_MS
  return Date.now() <= graceEnd
}

/**
 * Rescheduling closes CONFIG.session.rescheduleLockMinutesBeforeStart ahead of
 * the slot and stays closed after it, so a booking can't be moved out from
 * under a patient who is already waiting. Completed and cancelled ones are
 * likewise fixed.
 */
export const canReschedule = (appointment: Appointment): boolean => {
  if (appointment.status !== 'scheduled') return false
  const lockAt = parseUtc(appointment.scheduledAt).getTime() - CONFIG.session.rescheduleLockMinutesBeforeStart * MINUTE_MS
  return Date.now() < lockAt
}

export const matchesFilter = (appointment: Appointment, filter: BookingFilter): boolean => {
  if (filter === 'all') return true
  const status = deriveStatus(appointment)
  // "Upcoming" is a still-scheduled booking whose slot hasn't passed — which is
  // exactly what deriveStatus leaves as "scheduled".
  if (filter === 'upcoming') return status === 'scheduled'
  return status === filter
}

/** Newest-first for past buckets, soonest-first for upcoming ones. */
export const sortByScheduledAt = (appointments: Appointment[], direction: 'asc' | 'desc'): Appointment[] =>
  [...appointments].sort((a, b) =>
    direction === 'asc'
      ? a.scheduledAt.localeCompare(b.scheduledAt)
      : b.scheduledAt.localeCompare(a.scheduledAt),
  )
