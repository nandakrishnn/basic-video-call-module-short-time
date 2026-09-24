import { Mail, NotebookPen, PhoneOff, Phone as PhoneIcon } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { PatientSummary } from '@/types/user.types'
import { parseUtc } from '@/utils/date'

interface PhysioSessionPanelProps {
  /** Joined from the patient list; absent until that request lands. */
  patient?: PatientSummary
  patientAge: number | null
  sessionType: string
  scheduledAt: string
  actualStartAt: string | null
  onQuickNote: () => void
  onEndCallAndWriteNotes: () => void
}

// The API returns timestamps as raw ISO strings; they were previously rendered
// verbatim ("2026-09-24T16:03:06.994"), which is not a time a physio can read.
const formatStamp = (isoLike: string): string =>
  parseUtc(isoLike).toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

const labelStyle = {
  color: COLORS.text.muted,
  fontSize: FONT_SIZES.xs,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.09em',
}

const contactRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: COLORS.text.secondary,
  fontSize: FONT_SIZES.sm,
  minWidth: 0,
}

const truncate = {
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

export const PhysioSessionPanel = ({
  patient,
  patientAge,
  sessionType,
  scheduledAt,
  actualStartAt,
  onQuickNote,
  onEndCallAndWriteNotes,
}: PhysioSessionPanelProps): JSX.Element => {
  const name = patient?.fullName ?? MESSAGES.appointments.unknownPatient
  const issue = patient?.issue?.trim()

  return (
    <Card
      elevation="sm"
      padding={22}
      className="session-side-panel"
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <Avatar name={name} size={46} />
        <div style={{ minWidth: 0 }}>
          <h3 style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.lg, fontWeight: 800, margin: 0, ...truncate }}>
            {name}
          </h3>
          {patientAge !== null && (
            <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '2px 0 0' }}>
              Age {patientAge}
            </p>
          )}
        </div>
      </div>

      {issue && (
        <div>
          <span style={labelStyle}>{MESSAGES.patients.fieldIssue}</span>
          <p
            style={{
              display: 'inline-block',
              margin: '6px 0 0',
              padding: '5px 11px',
              borderRadius: RADII.pill,
              background: COLORS.primarySoft,
              color: COLORS.primaryStrong,
              fontSize: FONT_SIZES.base,
              fontWeight: 700,
            }}
          >
            {issue}
          </p>
        </div>
      )}

      {(patient?.phone || patient?.email) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
          <span style={labelStyle}>{MESSAGES.session.contactLabel}</span>
          {patient.phone && (
            <a href={`tel:${patient.phone}`} style={{ ...contactRowStyle, textDecoration: 'none' }}>
              <PhoneIcon size={14} style={{ flexShrink: 0 }} />
              <span style={truncate}>{patient.phone}</span>
            </a>
          )}
          {patient.email && (
            <a
              href={`mailto:${patient.email}`}
              title={patient.email}
              style={{ ...contactRowStyle, textDecoration: 'none' }}
            >
              <Mail size={14} style={{ flexShrink: 0 }} />
              <span style={truncate}>{patient.email}</span>
            </a>
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 16,
          borderRadius: RADII.md,
          background: COLORS.primarySofter,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={labelStyle}>{MESSAGES.session.typeLabel}</span>
          <span
            style={{
              color: COLORS.text.primary,
              fontSize: FONT_SIZES.md,
              fontWeight: 700,
              textTransform: 'capitalize',
            }}
          >
            {sessionType}
          </span>
        </div>

        {scheduledAt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={labelStyle}>Scheduled</span>
            <span style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.base }}>
              {formatStamp(scheduledAt)}
            </span>
          </div>
        )}

        {actualStartAt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={labelStyle}>Started</span>
            <span style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.base }}>
              {formatStamp(actualStartAt)}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
        <Button variant="secondary" onClick={onQuickNote} fullWidth>
          <NotebookPen size={16} />
          Quick Note
        </Button>
        <Button variant="primary" onClick={onEndCallAndWriteNotes} fullWidth>
          <PhoneOff size={16} />
          End Call &amp; Write Notes
        </Button>
      </div>
    </Card>
  )
}
