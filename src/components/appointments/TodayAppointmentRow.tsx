import { CalendarClock } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/shared/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { Appointment } from '@/types/appointment.types'
import type { PatientSummary } from '@/types/user.types'
import { canReschedule, canStartCall, deriveStatus } from '@/utils/appointment'
import { parseUtc } from '@/utils/date'

interface TodayAppointmentRowProps {
  appointment: Appointment
  /** Joined client-side from the patient list — absent until that request lands. */
  patient?: PatientSummary
  isStarting: boolean
  onStartCall: () => void
  /** Omit to hide the reschedule action entirely. */
  onReschedule?: () => void
}

export const TodayAppointmentRow = ({
  appointment,
  patient,
  isStarting,
  onStartCall,
  onReschedule,
}: TodayAppointmentRowProps): JSX.Element => {
  const status = deriveStatus(appointment)
  const scheduledAt = parseUtc(appointment.scheduledAt)
  const showStart = canStartCall(appointment)
  const rescheduleAllowed = canReschedule(appointment)
  const rescheduleHint = rescheduleAllowed
    ? MESSAGES.appointments.rescheduleAction
    : status === 'missed'
      ? MESSAGES.appointments.reschedulePassed
      : MESSAGES.appointments.rescheduleLocked

  const name = patient?.fullName ?? MESSAGES.appointments.unknownPatient
  const contact = patient ? (patient.email ?? patient.phone ?? MESSAGES.dashboard.noContactInfo) : ''

  return (
    <div className="appointment-row">
      <div className="appointment-row-time">
        <p style={{ color: COLORS.text.primary, fontWeight: 800, fontSize: FONT_SIZES.md, margin: 0 }}>
          {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p
          style={{
            color: COLORS.text.muted,
            fontSize: FONT_SIZES.xs,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            margin: '3px 0 0',
          }}
        >
          {appointment.sessionType}
        </p>
      </div>

      <div className="appointment-row-patient">
        <Avatar name={name} size={38} />
        <div style={{ minWidth: 0 }}>
          <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: FONT_SIZES.base, margin: 0 }}>{name}</p>
          {contact && (
            <p
              title={contact}
              style={{
                color: COLORS.text.secondary,
                fontSize: FONT_SIZES.sm,
                margin: '2px 0 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {contact}
            </p>
          )}
        </div>
      </div>

      <div className="appointment-row-actions">
        <StatusBadge status={status} />

        {onReschedule && appointment.status === 'scheduled' && (
          <Button
            variant="secondary"
            size="sm"
            disabled={!rescheduleAllowed}
            title={rescheduleHint}
            onClick={onReschedule}
          >
            <CalendarClock size={15} />
            {MESSAGES.appointments.rescheduleAction}
          </Button>
        )}

        {showStart && (
          <Button variant="primary" size="sm" isLoading={isStarting} onClick={onStartCall}>
            {isStarting ? MESSAGES.newCall.starting : MESSAGES.newCall.startCallButton}
          </Button>
        )}
      </div>
    </div>
  )
}
