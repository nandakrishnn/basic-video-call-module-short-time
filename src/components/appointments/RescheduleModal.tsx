import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Field } from '@/components/shared/Field'
import { Input } from '@/components/shared/Input'
import { Modal } from '@/components/shared/Modal'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { updateAppointmentRequest } from '@/services/appointment.service'
import type { Appointment } from '@/types/appointment.types'
import { parseUtc } from '@/utils/date'

interface RescheduleModalProps {
  appointment: Appointment
  patientName: string
  token: string
  onClose: () => void
  onRescheduled: () => void
}

/** Local-time YYYY-MM-DD / HH:MM to seed the date and time inputs. */
const toInputParts = (iso: string): { date: string; time: string } => {
  const d = parseUtc(iso)
  const pad = (n: number): string => String(n).padStart(2, '0')
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

export const RescheduleModal = ({
  appointment,
  patientName,
  token,
  onClose,
  onRescheduled,
}: RescheduleModalProps): JSX.Element => {
  const initial = toInputParts(appointment.scheduledAt)
  const [date, setDate] = useState(initial.date)
  const [time, setTime] = useState(initial.time)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (): Promise<void> => {
    if (!date || !time) {
      setError(MESSAGES.newCall.missingSchedule)
      return
    }

    const next = new Date(`${date}T${time}`)
    if (next.getTime() <= Date.now()) {
      setError(MESSAGES.appointments.rescheduleInPast)
      return
    }

    setIsSubmitting(true)
    setError(null)
    const res = await updateAppointmentRequest(token, appointment.id, { scheduledAt: next.toISOString() })
    setIsSubmitting(false)

    if (!res.success) {
      setError(res.message || MESSAGES.appointments.rescheduleFailed)
      return
    }

    onRescheduled()
    onClose()
  }

  return (
    <Modal
      title={MESSAGES.appointments.rescheduleTitle}
      subtitle={MESSAGES.appointments.rescheduleSubtitle}
      maxWidth={440}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
            {MESSAGES.common.cancel}
          </Button>
          <Button variant="primary" isLoading={isSubmitting} onClick={() => void handleSave()} style={{ flex: 2 }}>
            {isSubmitting ? MESSAGES.appointments.rescheduling : MESSAGES.appointments.rescheduleButton}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            padding: '12px 15px',
            borderRadius: RADII.md,
            background: COLORS.primarySofter,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: FONT_SIZES.base, margin: 0 }}>
            {patientName}
          </p>
          <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '3px 0 0' }}>
            {MESSAGES.appointments.rescheduleCurrently} {parseUtc(appointment.scheduledAt).toLocaleString()}
          </p>
        </div>

        <div className="form-row-2up">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Field label={MESSAGES.newCall.fieldDate}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Field label={MESSAGES.newCall.fieldTime}>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </div>
        </div>

        {error && (
          <p role="alert" style={{ color: COLORS.status.error, fontSize: FONT_SIZES.base, margin: 0 }}>
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}
