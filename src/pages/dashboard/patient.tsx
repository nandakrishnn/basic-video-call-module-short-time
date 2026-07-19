import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { BrandLinks } from '@/components/shared/BrandLinks'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageState } from '@/components/shared/PageState'
import { StatCard } from '@/components/shared/StatCard'
import { COLORS } from '@/constants/colors'
import { CONFIG } from '@/constants/config'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { getPatientDashboardRequest } from '@/services/dashboard.service'
import type { PatientDashboardData } from '@/types/dashboard.types'
import { parseUtc } from '@/utils/date'
import { getToken } from '@/utils/storage'

const sectionTitleStyle = { color: COLORS.text.primary, fontSize: '1.05rem', fontWeight: 700, marginBottom: 14 }

const PatientDashboardPage = (): JSX.Element => {
  const router = useRouter()
  const [data, setData] = useState<PatientDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    getPatientDashboardRequest(token)
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

  const sessionId = data.nextAppointment?.sessionId ?? null
  const withinJoinWindow = data.nextAppointment
    ? parseUtc(data.nextAppointment.scheduledAt).getTime() - Date.now() <=
      CONFIG.session.joinWindowMinutesBeforeStart * 60_000
    : false
  const canJoin = Boolean(sessionId) && withinJoinWindow

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background }}>
      <DashboardHeader title="Patient Dashboard" />
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '32px 20px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        <h1 style={{ color: COLORS.text.primary, fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Your sessions</h1>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StatCard label="Total calls" value={data.stats.totalCalls} />
          <StatCard label="Total minutes" value={data.stats.totalMinutes} />
        </div>

        <Card elevation="md">
          {data.nextAppointment ? (
            <>
              <p
                style={{
                  color: COLORS.text.muted,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                  margin: 0,
                }}
              >
                Next appointment
              </p>
              <p style={{ color: COLORS.text.primary, fontSize: '1.15rem', fontWeight: 800, margin: '6px 0 16px' }}>
                {parseUtc(data.nextAppointment.scheduledAt).toLocaleString()}
              </p>
              <Button
                variant={canJoin ? 'primary' : 'secondary'}
                disabled={!canJoin}
                onClick={() => sessionId && void router.push(ROUTES.session(sessionId))}
              >
                Join Call
              </Button>
            </>
          ) : (
            <EmptyState message={MESSAGES.dashboard.emptyUpcoming} />
          )}
        </Card>

        <section>
          <h2 style={sectionTitleStyle}>Past calls</h2>
          {data.pastCalls.length === 0 ? (
            <EmptyState message={MESSAGES.dashboard.emptyPastCalls} />
          ) : (
            <ul
              style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {data.pastCalls.map((call) => (
                <li key={call.sessionId}>
                  <Card
                    padding={16}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div>
                      <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
                        {call.startedAt ? parseUtc(call.startedAt).toLocaleString() : 'Date unavailable'}
                      </p>
                      <p style={{ color: COLORS.text.secondary, fontSize: '0.8rem', margin: '2px 0 0' }}>
                        with {call.physioName}
                      </p>
                    </div>
                    {call.report ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => window.open(call.report!.pdfUrl, '_blank', 'noopener,noreferrer')}
                      >
                        View Report
                      </Button>
                    ) : (
                      <span style={{ color: COLORS.text.muted, fontSize: '0.78rem' }}>Report pending</span>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <BrandLinks />
      </div>
    </div>
  )
}

export default PatientDashboardPage
