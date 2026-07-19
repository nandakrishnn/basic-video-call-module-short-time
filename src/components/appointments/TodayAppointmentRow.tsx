import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { COLORS } from '@/constants/colors'
import type { Appointment } from '@/types/appointment.types'
import { parseUtc } from '@/utils/date'

interface TodayAppointmentRowProps {
  appointment: Appointment
  isStarting: boolean
  onStartCall: () => void
}

export const TodayAppointmentRow = ({
  appointment,
  isStarting,
  onStartCall,
}: TodayAppointmentRowProps): JSX.Element => {
  return (
    <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} padding={16}>
      <div>
        <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
          {parseUtc(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ color: COLORS.text.secondary, fontSize: '0.8rem', textTransform: 'capitalize' }}>
            {appointment.sessionType}
          </span>
          <StatusBadge status={appointment.status} />
        </div>
      </div>
      <Button variant="primary" size="sm" isLoading={isStarting} onClick={onStartCall}>
        {isStarting ? 'Starting…' : 'Start Call'}
      </Button>
    </Card>
  )
}
