import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/shared/EmptyState'
import { COLORS } from '@/constants/colors'
import { CONFIG } from '@/constants/config'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { getPatientDashboardRequest } from '@/services/dashboard.service'
import type { PatientDashboardData } from '@/types/dashboard.types'
import { getToken } from '@/utils/storage'

const sectionTitleStyle = { color: COLORS.text.primary, fontSize: '1rem', fontWeight: 700, marginBottom: 12 }

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
    return <div style={{ padding: 40, color: COLORS.text.secondary }}>Loading…</div>
  }

  if (error || !data) {
    return <div style={{ padding: 40, color: COLORS.status.error }}>{error ?? MESSAGES.errors.generic}</div>
  }

  const sessionId = data.nextAppointment?.sessionId ?? null
  const withinJoinWindow = data.nextAppointment
    ? new Date(data.nextAppointment.scheduledAt).getTime() - Date.now() <=
      CONFIG.session.joinWindowMinutesBeforeStart * 60_000
    : false
  const canJoin = Boolean(sessionId) && withinJoinWindow

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '40px auto',
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      <h1 style={{ color: COLORS.text.primary, fontSize: '1.3rem', fontWeight: 800 }}>Your sessions</h1>

      <section style={{ padding: 20, borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
        {data.nextAppointment ? (
          <>
            <p style={{ color: COLORS.text.muted, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Next appointment
            </p>
            <p style={{ color: COLORS.text.primary, fontSize: '1.1rem', fontWeight: 800, margin: '6px 0 12px' }}>
              {new Date(data.nextAppointment.scheduledAt).toLocaleString()}
            </p>
            <button
              type="button"
              disabled={!canJoin}
              onClick={() => sessionId && void router.push(ROUTES.session(sessionId))}
              style={{
                padding: '10px 22px',
                borderRadius: 10,
                border: 'none',
                background: canJoin ? COLORS.primary : COLORS.border,
                color: COLORS.text.inverse,
                fontWeight: 700,
                cursor: canJoin ? 'pointer' : 'default',
              }}
            >
              Join Call
            </button>
          </>
        ) : (
          <EmptyState message={MESSAGES.dashboard.emptyUpcoming} />
        )}
      </section>

      <section>
        <h2 style={sectionTitleStyle}>Past sessions</h2>
        {data.pastSessions.length === 0 ? (
          <EmptyState message={MESSAGES.dashboard.emptyToday} />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.pastSessions.map((session) => (
              <li
                key={session.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text.secondary,
                  fontSize: '0.85rem',
                }}
              >
                {new Date(session.scheduledAt).toLocaleDateString()} · {session.sessionType}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={sectionTitleStyle}>Reports</h2>
        {data.reports.length === 0 ? (
          <EmptyState message={MESSAGES.dashboard.emptyReports} />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.reports.map((report) => (
              <li key={report.id}>
                <a
                  href={report.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 18px',
                    borderRadius: 10,
                    background: COLORS.primary,
                    color: COLORS.text.inverse,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                  }}
                >
                  Download Report — {new Date(report.sentAt).toLocaleDateString()}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default PatientDashboardPage
