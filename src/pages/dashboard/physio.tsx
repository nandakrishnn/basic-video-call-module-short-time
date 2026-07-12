import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { AppointmentList } from '@/components/appointments/AppointmentList'
import { TodayAppointmentRow } from '@/components/appointments/TodayAppointmentRow'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatCard } from '@/components/shared/StatCard'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { getPhysioDashboardRequest } from '@/services/dashboard.service'
import { createSessionRequest } from '@/services/session.service'
import type { PhysioDashboardData } from '@/types/dashboard.types'
import { getToken } from '@/utils/storage'

const sectionTitleStyle = { color: COLORS.text.primary, fontSize: '1rem', fontWeight: 700, marginBottom: 12 }

const PhysioDashboardPage = (): JSX.Element => {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [data, setData] = useState<PhysioDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingSessionFor, setStartingSessionFor] = useState<string | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    getPhysioDashboardRequest(token)
      .then((res) => {
        if (res.success) setData(res.data)
        else setError(res.message)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleStartCall = async (patientId: string, appointmentId: string): Promise<void> => {
    const token = getToken()
    if (!token) return

    setStartingSessionFor(appointmentId)
    const res = await createSessionRequest(token, patientId, appointmentId)
    setStartingSessionFor(null)

    if (res.success) void router.push(ROUTES.session(res.data.id))
  }

  if (isLoading || isAuthLoading) {
    return <div style={{ padding: 40, color: COLORS.text.secondary }}>Loading…</div>
  }

  if (error || !data) {
    return <div style={{ padding: 40, color: COLORS.status.error }}>{error ?? MESSAGES.errors.generic}</div>
  }

  return (
    <div
      style={{
        maxWidth: 960,
        margin: '40px auto',
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      <h1 style={{ color: COLORS.text.primary, fontSize: '1.3rem', fontWeight: 800 }}>
        Welcome, {user?.fullName ?? 'Doctor'}
      </h1>

      <div style={{ display: 'flex', gap: 16 }}>
        <StatCard label="Sessions today" value={data.stats.sessionsToday} />
        <StatCard label="This week" value={data.stats.sessionsThisWeek} />
        <StatCard label="This month" value={data.stats.sessionsThisMonth} />
      </div>

      <section>
        <h2 style={sectionTitleStyle}>Today&apos;s appointments</h2>
        {data.todayAppointments.length === 0 ? (
          <EmptyState message={MESSAGES.dashboard.emptyToday} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.todayAppointments.map((appointment) => (
              <TodayAppointmentRow
                key={appointment.id}
                appointment={appointment}
                isStarting={startingSessionFor === appointment.id}
                onStartCall={() => void handleStartCall(appointment.patientId, appointment.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={sectionTitleStyle}>This week</h2>
        {data.upcomingThisWeek.length === 0 ? (
          <EmptyState message={MESSAGES.dashboard.emptyUpcoming} />
        ) : (
          <AppointmentList appointments={data.upcomingThisWeek} />
        )}
      </section>

      <section>
        <h2 style={sectionTitleStyle}>Recent patients</h2>
        {data.recentPatientIds.length === 0 ? (
          <EmptyState message={MESSAGES.dashboard.emptyPatients} />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.recentPatientIds.map((id) => (
              <li key={id} style={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>
                Patient #{id.slice(0, 8)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default PhysioDashboardPage
