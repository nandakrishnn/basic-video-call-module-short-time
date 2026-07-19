import { Calendar, CalendarDays, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { AppointmentList } from '@/components/appointments/AppointmentList'
import { TodayAppointmentRow } from '@/components/appointments/TodayAppointmentRow'
import { SessionsTrendChart } from '@/components/dashboard/SessionsTrendChart'
import { AddPatientPanel } from '@/components/patients/AddPatientPanel'
import { NewCallPanel } from '@/components/session/NewCallPanel'
import { Avatar } from '@/components/shared/Avatar'
import { BrandLinks } from '@/components/shared/BrandLinks'
import { Card } from '@/components/shared/Card'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageState } from '@/components/shared/PageState'
import { StatCard } from '@/components/shared/StatCard'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { getPhysioDashboardRequest } from '@/services/dashboard.service'
import { listPatientsRequest } from '@/services/patient.service'
import { createSessionRequest } from '@/services/session.service'
import type { PhysioDashboardData } from '@/types/dashboard.types'
import type { User } from '@/types/user.types'
import { getToken } from '@/utils/storage'

const sectionTitleStyle = { color: COLORS.text.primary, fontSize: '1.05rem', fontWeight: 700, marginBottom: 14 }
const statIconStyle = { width: 20, height: 20 }

const PhysioDashboardPage = (): JSX.Element => {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [data, setData] = useState<PhysioDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingSessionFor, setStartingSessionFor] = useState<string | null>(null)
  const [patients, setPatients] = useState<User[]>([])
  const token = getToken()

  const fetchDashboard = useCallback((): void => {
    const token = getToken()
    if (!token) return
    getPhysioDashboardRequest(token)
      .then((res) => {
        if (res.success) setData(res.data)
        else setError(res.message)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

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

  const handleStartCall = async (patientId: string, appointmentId: string): Promise<void> => {
    const token = getToken()
    if (!token) return

    setStartingSessionFor(appointmentId)
    const res = await createSessionRequest(token, patientId, appointmentId)
    setStartingSessionFor(null)

    if (res.success) void router.push(ROUTES.session(res.data.id))
  }

  if (isLoading || isAuthLoading) {
    return <PageState tone="loading" message="Loading…" />
  }

  if (error || !data) {
    return <PageState tone="error" message={error ?? MESSAGES.errors.generic} />
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background }}>
      <DashboardSidebar />

      <div
        className="dashboard-content"
        style={{
          maxWidth: 1080,
          padding: '32px 40px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        <div>
          <h1 style={{ color: COLORS.text.primary, fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
            Welcome, {user?.fullName ?? 'Doctor'}
          </h1>
          <p style={{ color: COLORS.text.secondary, fontSize: '0.9rem', margin: '6px 0 0' }}>
            Here&apos;s what&apos;s happening with your patients today.
          </p>
        </div>

        {token && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <NewCallPanel
              token={token}
              patients={patients}
              onPatientAdded={handlePatientAdded}
              onScheduled={fetchDashboard}
            />
            <AddPatientPanel token={token} onPatientAdded={handlePatientAdded} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StatCard
            label="Sessions today"
            value={data.stats.sessionsToday}
            icon={<Calendar style={statIconStyle} />}
          />
          <StatCard
            label="This week"
            value={data.stats.sessionsThisWeek}
            icon={<CalendarDays style={statIconStyle} />}
          />
          <StatCard
            label="This month"
            value={data.stats.sessionsThisMonth}
            icon={<TrendingUp style={statIconStyle} />}
          />
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '2 1 480px', display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
            <section>
              <h2 style={sectionTitleStyle}>Sessions — last 14 days</h2>
              <Card elevation="sm">
                <SessionsTrendChart data={data.sessionsTrend} />
              </Card>
            </section>

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
          </div>

          <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
            <section>
              <h2 style={sectionTitleStyle}>Recent patients</h2>
              {data.recentPatients.length === 0 ? (
                <EmptyState message={MESSAGES.dashboard.emptyPatients} />
              ) : (
                <ul
                  style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {data.recentPatients.map((patient) => (
                    <li key={patient.id}>
                      <Card padding={16} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={patient.fullName} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
                            {patient.fullName}
                          </p>
                          <p
                            style={{
                              color: COLORS.text.secondary,
                              fontSize: '0.78rem',
                              margin: '2px 0 0',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {[patient.email, patient.phone].filter(Boolean).join(' · ') || 'No contact info'}
                          </p>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        <BrandLinks />
      </div>
    </div>
  )
}

export default PhysioDashboardPage
