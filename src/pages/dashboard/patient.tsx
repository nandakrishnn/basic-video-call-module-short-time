import { CalendarDays, Clock, FileText, Video } from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'
import { PanelCard } from '@/components/dashboard/PanelCard'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageState } from '@/components/shared/PageState'
import { StatCard } from '@/components/shared/StatCard'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { CONFIG } from '@/constants/config'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { getPatientDashboardRequest } from '@/services/dashboard.service'
import type { PatientDashboardData } from '@/types/dashboard.types'
import { parseUtc } from '@/utils/date'
import { getToken } from '@/utils/storage'

const PatientDashboardPage = (): JSX.Element => {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
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

  // Mirrors the physio dashboard's guard: the fetch above bails without
  // clearing isLoading when nobody is signed in, which would leave the
  // skeleton up forever.
  useEffect(() => {
    if (isAuthLoading) return
    if (!user || !getToken()) {
      setIsLoading(false)
      void router.push(ROUTES.patientLogin)
    }
  }, [isAuthLoading, user, router])

  const sessionId = data?.nextAppointment?.sessionId ?? null
  const withinJoinWindow = data?.nextAppointment
    ? parseUtc(data.nextAppointment.scheduledAt).getTime() - Date.now() <=
      CONFIG.session.joinWindowMinutesBeforeStart * 60_000
    : false
  // A session the physio has already started is joinable whatever the clock
  // says — the window exists to stop a patient arriving at an empty room.
  const canJoin = Boolean(sessionId) && (data?.isNextSessionLive || withinJoinWindow)

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
        <DashboardTopbar fullName={user?.fullName ?? MESSAGES.nav.rolePatient} />

        {isLoading ? (
          <DashboardSkeleton />
        ) : error || !data ? (
          <PageState tone="error" message={error ?? MESSAGES.errors.generic} />
        ) : (
          <>
            <div className="dash-stat-row">
              <StatCard
                label={MESSAGES.dashboard.patientTotalCalls}
                value={data.stats.totalCalls}
                icon={<Video size={20} />}
              />
              <StatCard
                label={MESSAGES.dashboard.patientTotalMinutes}
                value={data.stats.totalMinutes}
                icon={<Clock size={20} />}
              />
            </div>

            <Card padding={24} elevation="sm">
              {data.nextAppointment ? (
                <div className="patient-next-session">
                  <div style={{ minWidth: 0 }}>
                    <span className="dash-eyebrow">
                      <CalendarDays size={13} />
                      {data.isNextSessionLive
                        ? MESSAGES.dashboard.patientSessionLive
                        : MESSAGES.dashboard.patientNextAppointment}
                    </span>
                    <p
                      style={{
                        color: COLORS.text.primary,
                        fontSize: FONT_SIZES.xl,
                        fontWeight: 800,
                        margin: '8px 0 0',
                      }}
                    >
                      {parseUtc(data.nextAppointment.scheduledAt).toLocaleString()}
                    </p>
                    {!canJoin && (
                      <p style={{ color: COLORS.text.muted, fontSize: FONT_SIZES.sm, margin: '6px 0 0' }}>
                        {MESSAGES.dashboard.patientJoinOpensSoon}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    disabled={!canJoin}
                    onClick={() => sessionId && void router.push(ROUTES.session(sessionId))}
                  >
                    <Video size={16} />
                    {data.isNextSessionLive
                      ? MESSAGES.dashboard.patientRejoinCall
                      : MESSAGES.dashboard.patientJoinCall}
                  </Button>
                </div>
              ) : (
                <EmptyState message={MESSAGES.dashboard.emptyUpcoming} />
              )}
            </Card>

            <PanelCard title={MESSAGES.dashboard.patientPastSessions}>
              {data.pastCalls.length === 0 ? (
                <EmptyState message={MESSAGES.dashboard.emptyPastCalls} />
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {data.pastCalls.map((call) => (
                    <li key={call.sessionId} className="patient-session-item">
                      <div className="patient-session-row">
                        <div style={{ minWidth: 0 }}>
                          <span className="dash-eyebrow">
                            {MESSAGES.patients.sessionLabel} {call.sessionNumber}
                          </span>
                          <p
                            style={{
                              color: COLORS.text.primary,
                              fontWeight: 700,
                              fontSize: FONT_SIZES.base,
                              margin: '4px 0 0',
                            }}
                          >
                            {call.startedAt
                              ? parseUtc(call.startedAt).toLocaleString()
                              : MESSAGES.dashboard.patientDateUnavailable}
                          </p>
                          <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '3px 0 0' }}>
                            {MESSAGES.dashboard.patientWith} {call.physioName}
                          </p>
                        </div>
                        {call.report ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(call.report!.pdfUrl, '_blank', 'noopener,noreferrer')}
                          >
                            <FileText size={15} />
                            {MESSAGES.dashboard.patientViewReport}
                          </Button>
                        ) : (
                          <span
                            style={{
                              color: COLORS.text.muted,
                              fontSize: FONT_SIZES.sm,
                              fontWeight: 600,
                              padding: '6px 12px',
                              borderRadius: RADII.pill,
                              background: COLORS.surfaceAlt,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {MESSAGES.dashboard.patientReportPending}
                          </span>
                        )}
                      </div>

                      {/* Collapsed: a patient scanning for a date should not have
                          to scroll past five headings of someone else's session. */}
                      {call.notes && (
                        <details className="past-note" style={{ marginTop: 10 }}>
                          <summary className="past-note-summary">
                            <span
                              style={{
                                color: COLORS.text.primary,
                                fontWeight: 700,
                                fontSize: FONT_SIZES.sm,
                              }}
                            >
                              {MESSAGES.dashboard.patientViewNotes}
                            </span>
                          </summary>
                          <div
                            style={{
                              marginTop: 10,
                              padding: 14,
                              borderRadius: RADII.sm,
                              background: COLORS.primarySofter,
                              color: COLORS.text.secondary,
                              fontSize: FONT_SIZES.base,
                              lineHeight: 1.65,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {call.notes}
                          </div>
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>
          </>
        )}
      </div>
    </div>
  )
}

export default PatientDashboardPage
