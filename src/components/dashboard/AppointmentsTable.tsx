import { CalendarClock, Video } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { Appointment } from '@/types/appointment.types'
import type { PatientSummary } from '@/types/user.types'
import { canReschedule, canStartCall, deriveStatus } from '@/utils/appointment'
import { parseUtc } from '@/utils/date'

interface AppointmentsTableProps {
  rows: { appointment: Appointment; patient?: PatientSummary }[]
  sessionTypeLabel: (appointment: Appointment) => string
  startingId: string | null
  onJoinCall: (appointment: Appointment) => void
  onReschedule: (appointment: Appointment) => void
}

const headerCellStyle = {
  textAlign: 'left' as const,
  padding: '13px 18px',
  color: COLORS.text.secondary,
  fontSize: FONT_SIZES.sm,
  fontWeight: 700,
  whiteSpace: 'nowrap' as const,
}

const cellStyle = {
  padding: '14px 18px',
  borderTop: `1px solid ${COLORS.border}`,
  verticalAlign: 'middle' as const,
}

export const AppointmentsTable = ({
  rows,
  sessionTypeLabel,
  startingId,
  onJoinCall,
  onReschedule,
}: AppointmentsTableProps): JSX.Element => {
  if (rows.length === 0) {
    return <EmptyState message={MESSAGES.dashboard.emptyInRange} />
  }

  return (
    <div className="table-scroll">
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
        <thead>
          <tr style={{ background: COLORS.surfaceAlt }}>
            <th style={headerCellStyle}>{MESSAGES.dashboard.colTime}</th>
            <th style={headerCellStyle}>{MESSAGES.dashboard.colPatient}</th>
            <th style={headerCellStyle}>{MESSAGES.dashboard.colIssue}</th>
            <th style={headerCellStyle}>{MESSAGES.dashboard.colStatus}</th>
            <th style={{ ...headerCellStyle, textAlign: 'right' }}>{MESSAGES.dashboard.colAction}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ appointment, patient }) => {
            const at = parseUtc(appointment.scheduledAt)
            const name = patient?.fullName ?? MESSAGES.appointments.unknownPatient
            const issue = patient?.issue?.trim()
            const showJoin = canStartCall(appointment)

            return (
              <tr key={appointment.id}>
                <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                  <span style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.md, fontWeight: 800 }}>
                    {at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>

                <td style={cellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                    <Avatar name={name} size={38} />
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.base, fontWeight: 700, margin: 0 }}
                      >
                        {name}
                      </p>
                      {patient?.phone && (
                        <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '2px 0 0' }}>
                          {patient.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td style={cellStyle}>
                  <p style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.base, fontWeight: 600, margin: 0 }}>
                    {issue || MESSAGES.dashboard.noIssueRecorded}
                  </p>
                  <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '2px 0 0' }}>
                    {sessionTypeLabel(appointment)}
                  </p>
                </td>

                <td style={cellStyle}>
                  <StatusBadge status={deriveStatus(appointment)} />
                </td>

                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    {appointment.status === 'scheduled' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!canReschedule(appointment)}
                        title={
                          canReschedule(appointment)
                            ? MESSAGES.appointments.rescheduleAction
                            : deriveStatus(appointment) === 'missed'
                              ? MESSAGES.appointments.reschedulePassed
                              : MESSAGES.appointments.rescheduleLocked
                        }
                        onClick={() => onReschedule(appointment)}
                      >
                        <CalendarClock size={15} />
                        {MESSAGES.appointments.rescheduleAction}
                      </Button>
                    )}

                    {showJoin && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={startingId === appointment.id}
                        onClick={() => onJoinCall(appointment)}
                      >
                        <Video size={15} />
                        {MESSAGES.dashboard.joinCall}
                      </Button>
                    )}

                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
