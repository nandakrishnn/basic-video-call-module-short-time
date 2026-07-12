import { useState } from 'react'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { AppointmentType } from '@/types/appointment.types'

interface AppointmentFormProps {
  onSubmit: (data: { scheduledAt: string; sessionType: AppointmentType; internalNote?: string }) => void
  isSubmitting: boolean
}

const SESSION_TYPES: AppointmentType[] = ['initial', 'followup', 'review', 'discharge']

export const AppointmentForm = ({ onSubmit, isSubmitting }: AppointmentFormProps): JSX.Element => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [sessionType, setSessionType] = useState<AppointmentType>('followup')
  const [internalNote, setInternalNote] = useState('')

  const canSubmit = date.length > 0 && time.length > 0

  const handleSubmit = (): void => {
    if (!canSubmit) return
    onSubmit({
      scheduledAt: new Date(`${date}T${time}`).toISOString(),
      sessionType,
      internalNote: internalNote || undefined,
    })
  }

  const fieldStyle = { padding: '10px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}` }
  const labelStyle = { fontSize: '0.78rem', fontWeight: 600, color: COLORS.text.primary }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={labelStyle}>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={fieldStyle} />
        </label>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={labelStyle}>Time</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={fieldStyle} />
        </label>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={labelStyle}>Session type</span>
        <select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value as AppointmentType)}
          style={fieldStyle}
        >
          {SESSION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={labelStyle}>
          Internal note <span style={{ fontWeight: 400, color: COLORS.text.muted }}>(optional)</span>
        </span>
        <textarea
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          rows={3}
          style={{ ...fieldStyle, resize: 'vertical' }}
        />
      </label>

      <button
        type="button"
        disabled={!canSubmit || isSubmitting}
        onClick={handleSubmit}
        style={{
          padding: '12px',
          borderRadius: 10,
          border: 'none',
          background: COLORS.primary,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: canSubmit && !isSubmitting ? 'pointer' : 'default',
          opacity: canSubmit && !isSubmitting ? 1 : 0.6,
        }}
      >
        {isSubmitting ? 'Saving…' : MESSAGES.appointments.scheduleButton}
      </button>
    </div>
  )
}
