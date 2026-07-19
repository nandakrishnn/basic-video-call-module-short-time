import { useEffect, useState } from 'react'
import { Card } from '@/components/shared/Card'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Footer } from '@/components/shared/Footer'
import { PageState } from '@/components/shared/PageState'
import { StatCard } from '@/components/shared/StatCard'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { getAdminDashboardRequest } from '@/services/dashboard.service'
import type { AdminDashboardData } from '@/types/dashboard.types'
import { parseUtc } from '@/utils/date'
import { getToken } from '@/utils/storage'

const sectionTitleStyle = { color: COLORS.text.primary, fontSize: '1.05rem', fontWeight: 700, marginBottom: 14 }

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
    return <PageState tone="loading" message="Loading…" />
  }

  if (error || !data) {
    return <PageState tone="error" message={error ?? MESSAGES.errors.generic} />
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background }}>
      <DashboardHeader title="Admin Dashboard" />
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '32px 20px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
      <h1 style={{ color: COLORS.text.primary, fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Clinic overview</h1>

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
              <li key={appointment.id}>
                <Card padding={16}>
                  <span style={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>
                    {parseUtc(appointment.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {appointment.sessionType}
                  </span>
                </Card>
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
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.physios.map((physio) => (
              <li key={physio.id}>
                <Card padding={16}>
                  <span style={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>{physio.fullName}</span>
                </Card>
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
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.patients.map((patient) => (
              <li key={patient.id}>
                <Card padding={16}>
                  <span style={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>{patient.fullName}</span>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Footer />
      </div>
    </div>
  )
}

export default AdminDashboardPage
