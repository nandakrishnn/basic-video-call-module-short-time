import { useCallback, useEffect, useMemo, useState } from 'react'
import { RescheduleModal } from '@/components/appointments/RescheduleModal'
import { AppointmentList } from '@/components/appointments/AppointmentList'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageState } from '@/components/shared/PageState'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { useAuth } from '@/hooks/useAuth'
import { getAppointmentsByPhysioRequest } from '@/services/appointment.service'
import { listPatientsRequest } from '@/services/patient.service'
import type { Appointment } from '@/types/appointment.types'
import type { PatientSummary } from '@/types/user.types'
import { matchesFilter, sortByScheduledAt } from '@/utils/appointment'
import type { BookingFilter } from '@/utils/appointment'
import { getToken } from '@/utils/storage'

const FILTERS: { key: BookingFilter; label: string }[] = [
  { key: 'all', label: MESSAGES.appointments.filterAll },
  { key: 'upcoming', label: MESSAGES.appointments.filterUpcoming },
  { key: 'missed', label: MESSAGES.appointments.filterMissed },
  { key: 'completed', label: MESSAGES.appointments.filterCompleted },
  { key: 'cancelled', label: MESSAGES.appointments.filterCancelled },
]

const BookingsPage = (): JSX.Element => {
  const { user, isLoading: isAuthLoading } = useAuth()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patientsById, setPatientsById] = useState<Record<string, PatientSummary>>({})
  const [filter, setFilter] = useState<BookingFilter>('all')
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = getToken()

  const loadAppointments = useCallback((): void => {
    const token = getToken()
    if (!token || !user) return
    getAppointmentsByPhysioRequest(token, user.id)
      .then((res) => {
        if (res.success) setAppointments(res.data)
        else setError(res.message || MESSAGES.appointments.bookingsLoadFailed)
      })
      .finally(() => setIsLoading(false))
  }, [user])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  // Appointments carry only patientId, so names are joined from the patient list.
  useEffect(() => {
    const token = getToken()
    if (!token) return
    listPatientsRequest(token).then((res) => {
      if (!res.success) return
      const map: Record<string, PatientSummary> = {}
      for (const patient of res.data) map[patient.id] = patient
      setPatientsById(map)
    })
  }, [])

  const counts = useMemo(() => {
    const result = {} as Record<BookingFilter, number>
    for (const { key } of FILTERS) result[key] = appointments.filter((a) => matchesFilter(a, key)).length
    return result
  }, [appointments])

  const visible = useMemo(() => {
    const filtered = appointments.filter((a) => matchesFilter(a, filter))
    // Upcoming reads best soonest-first; everything else is history, newest-first.
    return sortByScheduledAt(filtered, filter === 'upcoming' ? 'asc' : 'desc')
  }, [appointments, filter])

  if (isLoading || isAuthLoading) {
    return <PageState tone="loading" message="Loading…" />
  }

  if (error) {
    return <PageState tone="error" message={error} />
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background }}>
      <DashboardSidebar />

      <div
        className="dashboard-content"
        style={{
          maxWidth: 1240,
          padding: '32px 40px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <header>
          <h1 style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.xl, fontWeight: 800, margin: 0 }}>
            {MESSAGES.appointments.bookingsTitle}
          </h1>
          <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.md, margin: '6px 0 0' }}>
            {MESSAGES.appointments.bookingsSubtitle}
          </p>
        </header>

        <div className="filter-tabs" role="tablist" aria-label={MESSAGES.appointments.bookingsTitle}>
          {FILTERS.map(({ key, label }) => {
            const active = filter === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={`filter-tab${active ? ' active' : ''}`}
              >
                {label}
                <span
                  style={{
                    padding: '1px 7px',
                    borderRadius: RADII.pill,
                    background: active ? COLORS.surface : COLORS.surfaceAlt,
                    color: active ? COLORS.primaryStrong : COLORS.text.muted,
                    fontSize: FONT_SIZES.xs,
                    fontWeight: 800,
                  }}
                >
                  {counts[key]}
                </span>
              </button>
            )
          })}
        </div>

        {appointments.length === 0 ? (
          <EmptyState message={MESSAGES.appointments.bookingsEmpty} />
        ) : visible.length === 0 ? (
          <EmptyState message={MESSAGES.appointments.bookingsNoneInFilter} />
        ) : (
          <AppointmentList
            appointments={visible}
            patientsById={patientsById}
            onReschedule={setReschedulingAppointment}
          />
        )}
      </div>

      {reschedulingAppointment && token && (
        <RescheduleModal
          appointment={reschedulingAppointment}
          patientName={patientsById[reschedulingAppointment.patientId]?.fullName ?? ''}
          token={token}
          onClose={() => setReschedulingAppointment(null)}
          onRescheduled={loadAppointments}
        />
      )}
    </div>
  )
}

export default BookingsPage
