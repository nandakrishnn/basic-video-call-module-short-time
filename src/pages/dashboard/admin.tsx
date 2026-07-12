import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatCard } from '@/components/shared/StatCard'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { getAdminDashboardRequest } from '@/services/dashboard.service'
import type { AdminDashboardData } from '@/types/dashboard.types'
import { getToken } from '@/utils/storage'

const sectionTitleStyle = { color: COLORS.text.primary, fontSize: '1rem', fontWeight: 700, marginBottom: 12 }
const listItemStyle = {
  padding: '14px 16px',
  borderRadius: 12,
  background: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text.secondary,
  fontSize: '0.85rem',
}

const AdminDashboardPage = (): JSX.Element => {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    getAdminDashboardRequest(token)
      .then((res) => {
        if (res.success) setData(res.data)
        else setError(res.message)
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
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
      <h1 style={{ color: COLORS.text.primary, fontSize: '1.3rem', fontWeight: 800 }}>Clinic overview</h1>

      <div style={{ display: 'flex', gap: 16 }}>
        <StatCard label="Appointments today" value={data.stats.totalAppointmentsToday} />
        <StatCard label="Physios" value={data.stats.totalPhysios} />
        <StatCard label="Patients" value={data.stats.totalPatients} />
      </div>

      <section>
        <h2 style={sectionTitleStyle}>Today across all physios</h2>
        {data.todayAppointments.length === 0 ? (
          <EmptyState message={MESSAGES.dashboard.emptyToday} />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.todayAppointments.map((appointment) => (
              <li key={appointment.id} style={listItemStyle}>
                {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                {appointment.sessionType}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={sectionTitleStyle}>Physios</h2>
        {data.physios.length === 0 ? (
          <EmptyState message={MESSAGES.dashboard.emptyPatients} />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.physios.map((physio) => (
              <li key={physio.id} style={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>
                {physio.fullName}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={sectionTitleStyle}>Patients</h2>
        {data.patients.length === 0 ? (
          <EmptyState message={MESSAGES.dashboard.emptyPatients} />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.patients.map((patient) => (
              <li key={patient.id} style={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>
                {patient.fullName}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default AdminDashboardPage
