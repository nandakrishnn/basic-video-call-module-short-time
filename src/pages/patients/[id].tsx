import { ArrowLeft, Download, FileText, Mail, Phone } from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/shared/Avatar'
import { Card } from '@/components/shared/Card'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageState } from '@/components/shared/PageState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { getPatientHistoryRequest, type PatientHistory } from '@/services/patient.service'
import { parseUtc } from '@/utils/date'
import { getToken } from '@/utils/storage'

const labelStyle = {
  color: COLORS.text.muted,
  fontSize: FONT_SIZES.xs,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.09em',
}

/**
 * Supabase serves storage objects inline unless asked otherwise, so the report
 * would open in the browser's PDF viewer rather than save. `download` sets the
 * Content-Disposition and names the file.
 */
const downloadHref = (pdfUrl: string, patientName: string, sessionNumber: number): string => {
  const fileName = `${patientName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-session-${sessionNumber}.pdf`
  return `${pdfUrl}${pdfUrl.includes('?') ? '&' : '?'}download=${encodeURIComponent(fileName)}`
}

const stamp = (iso: string | null): string =>
  iso
    ? parseUtc(iso).toLocaleString([], {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

const PatientDetailPage = (): JSX.Element => {
  const router = useRouter()
  const { id } = router.query as { id?: string }

  const [history, setHistory] = useState<PatientHistory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      void router.push(ROUTES.login)
      return
    }

    getPatientHistoryRequest(token, id)
      .then((res) => {
        if (res.success) setHistory(res.data)
        else setError(res.message || MESSAGES.patients.loadFailed)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) return <PageState tone="loading" message="Loading…" />
  if (error || !history) return <PageState tone="error" message={error ?? MESSAGES.errors.generic} />

  const { patient, sessions } = history
  const issue = patient.issue?.trim()

  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: COLORS.background }}>
      <DashboardSidebar />

      <div
        className="dashboard-content"
        style={{
          maxWidth: 940,
          padding: '32px 40px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <button
          type="button"
          onClick={() => void router.push(ROUTES.patients)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            alignSelf: 'flex-start',
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: COLORS.primaryStrong,
            fontFamily: 'inherit',
            fontSize: FONT_SIZES.base,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          {MESSAGES.patients.backToList}
        </button>

        <Card padding={24} elevation="sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Avatar name={patient.fullName} size={56} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.xl, fontWeight: 800, margin: 0 }}>
                {patient.fullName}
              </h1>
              {issue && (
                <span
                  style={{
                    display: 'inline-block',
                    margin: '8px 0 0',
                    padding: '4px 11px',
                    borderRadius: RADII.pill,
                    background: COLORS.primarySoft,
                    color: COLORS.primaryStrong,
                    fontSize: FONT_SIZES.sm,
                    fontWeight: 700,
                  }}
                >
                  {issue}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {patient.phone && (
                <a
                  href={`tel:${patient.phone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: COLORS.text.secondary,
                    fontSize: FONT_SIZES.base,
                    textDecoration: 'none',
                  }}
                >
                  <Phone size={15} />
                  {patient.phone}
                </a>
              )}
              {patient.email && (
                <a
                  href={`mailto:${patient.email}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: COLORS.text.secondary,
                    fontSize: FONT_SIZES.base,
                    textDecoration: 'none',
                  }}
                >
                  <Mail size={15} />
                  {patient.email}
                </a>
              )}
            </div>
          </div>
        </Card>

        <div>
          <h2
            style={{
              color: COLORS.text.primary,
              fontSize: FONT_SIZES.lg,
              fontWeight: 700,
              margin: '0 0 4px',
            }}
          >
            {MESSAGES.patients.sessionHistory}
          </h2>
          <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.base, margin: '0 0 14px' }}>
            {sessions.length === 1
              ? MESSAGES.patients.sessionCountOne
              : MESSAGES.patients.sessionCountMany(sessions.length)}
          </p>

          {sessions.length === 0 ? (
            <EmptyState message={MESSAGES.patients.noSessions} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sessions.map((session) => {
                // Prefer the approved text; fall back to the raw draft so a
                // session written up but never approved still shows its notes.
                const body = session.notes?.enhancedNotes?.trim() || session.notes?.rawNotes?.trim()

                return (
                  <Card key={session.id} padding={20} elevation="sm">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginBottom: body ? 14 : 0,
                      }}
                    >
                      <div>
                        <span style={labelStyle}>
                          {MESSAGES.patients.sessionLabel} {session.sessionNumber}
                          {session.sessionType ? ` · ${session.sessionType}` : ''}
                        </span>
                        <p
                          style={{
                            color: COLORS.text.primary,
                            fontSize: FONT_SIZES.md,
                            fontWeight: 700,
                            margin: '3px 0 0',
                          }}
                        >
                          {stamp(session.startedAt ?? session.scheduledAt)}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {session.notes?.isSentToPatient && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              color: COLORS.status.success,
                              fontSize: FONT_SIZES.sm,
                              fontWeight: 600,
                            }}
                          >
                            <FileText size={14} />
                            {MESSAGES.patients.reportSent}
                          </span>
                        )}

                        {/* Shown whenever a PDF exists, not only once it has been
                            sent — a generated report is worth having either way. */}
                        {session.notes?.pdfUrl && (
                          <a
                            href={downloadHref(session.notes.pdfUrl, patient.fullName, session.sessionNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 7,
                              padding: '8px 14px',
                              borderRadius: RADII.md,
                              border: `1px solid ${COLORS.border}`,
                              background: COLORS.surface,
                              color: COLORS.primaryStrong,
                              fontSize: FONT_SIZES.sm,
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            <Download size={15} />
                            {MESSAGES.patients.downloadReport}
                          </a>
                        )}

                        <StatusBadge status={session.status} />
                      </div>
                    </div>

                    {body ? (
                      <div
                        style={{
                          padding: 16,
                          borderRadius: RADII.md,
                          background: COLORS.primarySofter,
                          border: `1px solid ${COLORS.border}`,
                          color: COLORS.text.primary,
                          fontSize: FONT_SIZES.base,
                          lineHeight: 1.7,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {body}
                      </div>
                    ) : (
                      <p
                        style={{
                          color: COLORS.text.muted,
                          fontSize: FONT_SIZES.base,
                          fontStyle: 'italic',
                          margin: '12px 0 0',
                        }}
                      >
                        {MESSAGES.patients.noNotes}
                      </p>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientDetailPage
