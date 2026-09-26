import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RescheduleModal } from '@/components/appointments/RescheduleModal'
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'
import { HeroBanner } from '@/components/dashboard/HeroBanner'
import { NextSessionCard } from '@/components/dashboard/NextSessionCard'
import { AddPatientPanel } from '@/components/patients/AddPatientPanel'
import { NewCallPanel } from '@/components/session/NewCallPanel'
import { Card } from '@/components/shared/Card'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { DatePicker } from '@/components/shared/DatePicker'
import { SelectMenu } from '@/components/shared/SelectMenu'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { getAppointmentsByPhysioRequest } from '@/services/appointment.service'
import { listPatientsRequest } from '@/services/patient.service'
import { createSessionRequest } from '@/services/session.service'
import type { Appointment } from '@/types/appointment.types'
import type { PatientSummary, User } from '@/types/user.types'
import { isUpcoming, matchesFilter, sortByScheduledAt } from '@/utils/appointment'
import type { BookingFilter } from '@/utils/appointment'
import { parseUtc } from '@/utils/date'
import { getToken } from '@/utils/storage'

type RangeTab = 'today' | 'week' | 'month'

const TABS: { key: RangeTab; label: string }[] = [
  { key: 'today', label: MESSAGES.dashboard.tabToday },
  { key: 'week', label: MESSAGES.dashboard.tabThisWeek },
  { key: 'month', label: MESSAGES.dashboard.tabThisMonth },
]

// Same set and wording as the Bookings page, so a status means one thing
// wherever it is filtered.
const STATUS_FILTERS: { key: BookingFilter; label: string }[] = [
  { key: 'all', label: MESSAGES.dashboard.filterAllStatuses },
  { key: 'upcoming', label: MESSAGES.appointments.filterUpcoming },
  { key: 'missed', label: MESSAGES.appointments.filterMissed },
  { key: 'completed', label: MESSAGES.appointments.filterCompleted },
  { key: 'cancelled', label: MESSAGES.appointments.filterCancelled },
]

const toDateInput = (date: Date): string => {
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Inclusive local-time bounds for the chosen tab, anchored on `anchor`. */
const rangeFor = (tab: RangeTab, anchor: Date): { start: Date; end: Date } => {
  const start = new Date(anchor)
  start.setHours(0, 0, 0, 0)
  const end = new Date(anchor)
  end.setHours(23, 59, 59, 999)

  if (tab === 'week') {
    start.setDate(start.getDate() - start.getDay())
    end.setTime(start.getTime())
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
  }

  if (tab === 'month') {
    start.setDate(1)
    end.setMonth(start.getMonth() + 1, 0)
    end.setHours(23, 59, 59, 999)
  }

  return { start, end }
}

const PhysioDashboardPage = (): JSX.Element => {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<User[]>([])
  const [tab, setTab] = useState<RangeTab>('today')
  const [statusFilter, setStatusFilter] = useState<BookingFilter>('all')
  const [anchorDate, setAnchorDate] = useState(() => toDateInput(new Date()))
  const [query, setQuery] = useState('')
  const [startingId, setStartingId] = useState<string | null>(null)
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
        else setError(res.message)
      })
      .finally(() => setIsLoading(false))
  }, [user])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  // loadAppointments bails without clearing isLoading when there is no signed-in
  // user, so without this the page would sit on its skeleton forever. Once auth
  // has settled with nobody signed in, send them to log in — this route is
  // physio-only and previously had no guard at all.
  useEffect(() => {
    if (isAuthLoading) return
    if (!user || !getToken()) {
      setIsLoading(false)
      void router.push(ROUTES.login)
    }
  }, [isAuthLoading, user, router])

  useEffect(() => {
    const token = getToken()
    if (!token) return
    listPatientsRequest(token).then((res) => {
      if (res.success) setPatients(res.data)
    })
  }, [])

  const handlePatientAdded = (patient: User): void => {
    setPatients((prev) => [...prev, patient])
  }

  // Appointments carry only patientId, so names, phone and issue are joined here.
  const patientsById = useMemo(() => {
    const map: Record<string, PatientSummary> = {}
    for (const patient of patients) map[patient.id] = patient
    return map
  }, [patients])

  const sessionTypeLabel = useCallback(
    (appointment: Appointment): string =>
      appointment.sessionType === 'initial' ? MESSAGES.dashboard.typeNewPatient : MESSAGES.dashboard.typeFollowUp,
    [],
  )

  const handleStartCall = async (appointment: Appointment): Promise<void> => {
    const token = getToken()
    if (!token) return

    setError(null)
    setStartingId(appointment.id)
    const res = await createSessionRequest(token, appointment.patientId, appointment.id)
    setStartingId(null)

    if (res.success) void router.push(ROUTES.session(res.data.id))
    else setError(res.message)
  }

  // The next session is the soonest still-upcoming booking, regardless of the
  // range tab below — it must not disappear when browsing another week.
  const nextSession = useMemo(
    () => sortByScheduledAt(appointments.filter(isUpcoming), 'asc')[0],
    [appointments],
  )

  // Everything in the chosen date range, before the status filter — so the
  // status counts below describe this range rather than the current selection.
  const inRange = useMemo(() => {
    const { start, end } = rangeFor(tab, new Date(`${anchorDate}T00:00:00`))
    const normalized = query.trim().toLowerCase()

    return appointments.filter((appointment) => {
      const at = parseUtc(appointment.scheduledAt).getTime()
      if (at < start.getTime() || at > end.getTime()) return false
      if (!normalized) return true
      const patient = patientsById[appointment.patientId]
      const haystack = [patient?.fullName, patient?.phone, patient?.issue].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(normalized)
    })
  }, [appointments, patientsById, tab, anchorDate, query])

  const statusCounts = useMemo(() => {
    const counts = {} as Record<BookingFilter, number>
    for (const { key } of STATUS_FILTERS) counts[key] = inRange.filter((a) => matchesFilter(a, key)).length
    return counts
  }, [inRange])

  const visibleRows = useMemo(
    () =>
      sortByScheduledAt(
        inRange.filter((appointment) => matchesFilter(appointment, statusFilter)),
        'asc',
      ).map((appointment) => ({ appointment, patient: patientsById[appointment.patientId] })),
    [inRange, statusFilter, patientsById],
  )

  if (isLoading || isAuthLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: COLORS.background }}>
      <DashboardSidebar />

      <div
        className="dashboard-content"
        style={{
          maxWidth: 1320,
          padding: '28px 36px 56px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <DashboardTopbar fullName={user?.fullName ?? 'Doctor'} query={query} onQueryChange={setQuery} />

        <HeroBanner />

        {nextSession && (
          <NextSessionCard
            appointment={nextSession}
            patient={patientsById[nextSession.patientId]}
            sessionTypeLabel={sessionTypeLabel(nextSession)}
            isStarting={startingId === nextSession.id}
            onStart={() => void handleStartCall(nextSession)}
          />
        )}

        <Card padding={0} elevation="sm">
          <div className="dash-table-toolbar" style={{ padding: '14px 18px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <div className="dash-tabs" role="tablist" aria-label={MESSAGES.dashboard.colTime}>
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => setTab(key)}
                    className={`dash-tab${tab === key ? ' active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Counts describe the chosen date range, not the current
                  selection, so you can see what switching would reveal. */}
              <div style={{ marginBottom: 10 }}>
                <SelectMenu
                  value={statusFilter}
                  onChange={setStatusFilter}
                  ariaLabel={MESSAGES.dashboard.colStatus}
                  options={STATUS_FILTERS.map(({ key, label }) => ({
                    value: key,
                    label,
                    count: statusCounts[key] ?? 0,
                  }))}
                />
              </div>
            </div>

            <div className="dash-toolbar-actions">
              <div style={{ minWidth: 210 }}>
                <DatePicker
                  value={anchorDate}
                  onChange={setAnchorDate}
                  ariaLabel={MESSAGES.newCall.fieldDate}
                />
              </div>
              {token && (
                <>
                  <AddPatientPanel token={token} onPatientAdded={handlePatientAdded} />
                  <NewCallPanel
                    token={token}
                    patients={patients}
                    onPatientAdded={handlePatientAdded}
                    onScheduled={loadAppointments}
                    label={MESSAGES.dashboard.newAppointment}
                  />
                </>
              )}
            </div>
          </div>

          {error && (
            <p
              role="alert"
              style={{ color: COLORS.status.error, fontSize: FONT_SIZES.base, margin: 0, padding: '12px 18px 0' }}
            >
              {error}
            </p>
          )}

          <AppointmentsTable
            rows={visibleRows}
            sessionTypeLabel={sessionTypeLabel}
            startingId={startingId}
            onJoinCall={(appointment) => void handleStartCall(appointment)}
            onReschedule={setReschedulingAppointment}
          />
        </Card>
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

export default PhysioDashboardPage
