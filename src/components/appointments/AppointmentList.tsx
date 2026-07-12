import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { Appointment } from '@/types/appointment.types'

interface AppointmentListProps {
  appointments: Appointment[]
}

export const AppointmentList = ({ appointments }: AppointmentListProps): JSX.Element => {
  if (appointments.length === 0) {
    return <p style={{ color: COLORS.text.muted, fontSize: '0.88rem' }}>{MESSAGES.appointments.emptyList}</p>
  }

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0 }}>
      {appointments.map((appointment) => (
        <li
          key={appointment.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            borderRadius: 12,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div>
            <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
              {new Date(appointment.scheduledAt).toLocaleString()}
            </p>
            <p
              style={{
                color: COLORS.text.secondary,
                fontSize: '0.8rem',
                margin: '2px 0 0',
                textTransform: 'capitalize',
              }}
            >
              {appointment.sessionType} · {appointment.status}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
