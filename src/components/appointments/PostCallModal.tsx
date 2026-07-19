import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { Appointment, AppointmentType } from '@/types/appointment.types'
import { parseUtc } from '@/utils/date'
import { AppointmentForm } from './AppointmentForm'

interface ScheduleData {
  scheduledAt: string
  sessionType: AppointmentType
  internalNote?: string
}

interface PostCallModalProps {
  patientEmail: string | null
  patientName: string
  physioName: string
  onSchedule: (data: ScheduleData) => Promise<Appointment | null>
  onClose: () => void
}

const buildMailtoHref = (appointment: Appointment, patientEmail: string, patientName: string, physioName: string): string => {
  const dateLabel = parseUtc(appointment.scheduledAt).toLocaleDateString()
  const whenLabel = parseUtc(appointment.scheduledAt).toLocaleString()
  const subject = `Your Clinzor Physiotherapy Session — ${dateLabel}`
  const body = `Hi ${patientName},\n\nYour next session with ${physioName} has been scheduled for ${whenLabel}.\n\nSee you soon!\nClinzor Team`
  return `mailto:${patientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export const PostCallModal = ({
  patientEmail,
  patientName,
  physioName,
  onSchedule,
  onClose,
}: PostCallModalProps): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [created, setCreated] = useState<Appointment | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ScheduleData): Promise<void> => {
    setIsSubmitting(true)
    setError(null)
    const appointment = await onSchedule(data)
    setIsSubmitting(false)
    if (appointment) setCreated(appointment)
    else setError(MESSAGES.appointments.createFailed)
  }

  const mailtoHref =
    created && patientEmail ? buildMailtoHref(created, patientEmail, patientName, physioName) : undefined

  return (
    <Modal maxWidth={420}>
      {!created ? (
        <>
          <h2 style={{ color: COLORS.text.primary, fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px' }}>
            Schedule next session
          </h2>
          <p style={{ color: COLORS.text.secondary, fontSize: '0.85rem', margin: '0 0 20px' }}>
            Optional — you can also do this later from the patient profile.
          </p>
          <AppointmentForm onSubmit={(d) => void handleSubmit(d)} isSubmitting={isSubmitting} />
          {error && <p style={{ color: COLORS.status.error, fontSize: '0.82rem', marginTop: 10 }}>{error}</p>}
          <Button variant="ghost" fullWidth onClick={onClose} style={{ marginTop: 12 }}>
            Skip for now
          </Button>
        </>
      ) : (
        <>
          <p style={{ color: COLORS.status.success, fontWeight: 700, margin: '0 0 20px' }}>
            {MESSAGES.appointments.createSuccess}
          </p>
          {mailtoHref && (
            <Button
              variant="primary"
              fullWidth
              style={{ marginBottom: 12 }}
              onClick={() => window.open(mailtoHref, '_blank', 'noopener,noreferrer')}
            >
              {MESSAGES.appointments.shareEmailButton}
            </Button>
          )}
          <Button variant="secondary" fullWidth onClick={onClose}>
            Done
          </Button>
        </>
      )}
    </Modal>
  )
}
