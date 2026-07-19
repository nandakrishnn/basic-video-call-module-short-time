import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Input, Select, Textarea } from '@/components/shared/Input'
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

  const labelStyle = { fontSize: '0.78rem', fontWeight: 600, color: COLORS.text.primary }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={labelStyle}>Date</span>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={labelStyle}>Time</span>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>Session type</span>
        <Select value={sessionType} onChange={(e) => setSessionType(e.target.value as AppointmentType)}>
          {SESSION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </Select>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>
          Internal note <span style={{ fontWeight: 400, color: COLORS.text.muted }}>(optional)</span>
        </span>
        <Textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} rows={3} />
      </label>

      <Button variant="primary" fullWidth disabled={!canSubmit} isLoading={isSubmitting} onClick={handleSubmit}>
        {isSubmitting ? 'Saving…' : MESSAGES.appointments.scheduleButton}
      </Button>
    </div>
  )
}
