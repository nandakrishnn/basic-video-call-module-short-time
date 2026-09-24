import { CalendarClock } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { Appointment } from '@/types/appointment.types'
import type { PatientSummary } from '@/types/user.types'
import { canReschedule, deriveStatus } from '@/utils/appointment'
import { parseUtc } from '@/utils/date'

interface AppointmentListProps {
  appointments: Appointment[]
  /** Looks up display details by appointment.patientId; joined client-side. */
  patientsById?: Record<string, PatientSummary>
  /** Omit to render the list read-only. */
  onReschedule?: (appointment: Appointment) => void
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }

export const AppointmentList = ({
  appointments,
  patientsById,
  onReschedule,
}: AppointmentListProps): JSX.Element => {
  if (appointments.length === 0) {
    return <EmptyState message={MESSAGES.appointments.emptyList} />
  }

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0 }}>
      {appointments.map((appointment) => {
        const patient = patientsById?.[appointment.patientId]
        const name = patient?.fullName ?? MESSAGES.appointments.unknownPatient
        const contact = patient ? (patient.email ?? patient.phone ?? MESSAGES.dashboard.noContactInfo) : ''
        const scheduledAt = parseUtc(appointment.scheduledAt)

        return (
          <li key={appointment.id}>
            <div className="appointment-row">
              <div className="appointment-row-time">
                <p style={{ color: COLORS.text.primary, fontWeight: 800, fontSize: FONT_SIZES.base, margin: 0 }}>
                  {scheduledAt.toLocaleDateString([], DATE_FORMAT)}
                </p>
                <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '3px 0 0' }}>
                  {scheduledAt.toLocaleTimeString([], TIME_FORMAT)}
                </p>
              </div>

              <div className="appointment-row-patient">
                <Avatar name={name} size={38} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: FONT_SIZES.base, margin: 0 }}>
                    {name}
                  </p>
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
                <span style={{ color: COLORS.text.muted, fontSize: FONT_SIZES.sm, textTransform: 'capitalize' }}>
                  {appointment.sessionType}
                </span>
                <StatusBadge status={deriveStatus(appointment)} />
                {onReschedule && appointment.status === 'scheduled' && (
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
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
