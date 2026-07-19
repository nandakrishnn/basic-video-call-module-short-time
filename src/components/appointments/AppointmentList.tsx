import { Card } from '@/components/shared/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { Appointment } from '@/types/appointment.types'
import { parseUtc } from '@/utils/date'

interface AppointmentListProps {
  appointments: Appointment[]
}

export const AppointmentList = ({ appointments }: AppointmentListProps): JSX.Element => {
  if (appointments.length === 0) {
    return <EmptyState message={MESSAGES.appointments.emptyList} />
  }

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0 }}>
      {appointments.map((appointment) => (
        <li key={appointment.id}>
          <Card padding={16}>
            <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
              {parseUtc(appointment.scheduledAt).toLocaleString()}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ color: COLORS.text.secondary, fontSize: '0.8rem', textTransform: 'capitalize' }}>
                {appointment.sessionType}
              </span>
              <StatusBadge status={appointment.status} />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}
