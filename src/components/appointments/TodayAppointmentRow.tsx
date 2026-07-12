import { COLORS } from '@/constants/colors'
import type { Appointment } from '@/types/appointment.types'

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
    <div
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
          {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      <button
        type="button"
        disabled={isStarting}
        onClick={onStartCall}
        style={{
          padding: '8px 18px',
          borderRadius: 10,
          border: 'none',
          background: COLORS.primary,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: isStarting ? 'default' : 'pointer',
          opacity: isStarting ? 0.6 : 1,
        }}
      >
        {isStarting ? 'Starting…' : 'Start Call'}
      </button>
    </div>
  )
}
