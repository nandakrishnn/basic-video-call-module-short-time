import { Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
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

  // No onClose passed to Modal on purpose — this dialog has no dismiss affordance
  // so the physio makes an explicit Skip / Done choice after a call.
  return (
    <Modal
      title={created ? 'Session scheduled' : 'Schedule next session'}
      subtitle={created ? undefined : 'Optional — you can also do this later from the patient profile.'}
      maxWidth={440}
      footer={
        created ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mailtoHref && (
              <Button
                variant="primary"
                fullWidth
                onClick={() => window.open(mailtoHref, '_blank', 'noopener,noreferrer')}
              >
                {MESSAGES.appointments.shareEmailButton}
              </Button>
            )}
            <Button variant="secondary" fullWidth onClick={onClose}>
              {MESSAGES.newCall.doneButton}
            </Button>
          </div>
        ) : (
          <Button variant="ghost" fullWidth onClick={onClose}>
            Skip for now
          </Button>
        )
      }
    >
      {created ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '13px 15px',
            borderRadius: RADII.sm,
            background: COLORS.statusSoft.success,
            color: COLORS.status.success,
            fontSize: FONT_SIZES.base,
            fontWeight: 600,
          }}
        >
          <Check size={17} />
          {MESSAGES.appointments.createSuccess}
        </div>
      ) : (
        <>
          <AppointmentForm onSubmit={(d) => void handleSubmit(d)} isSubmitting={isSubmitting} />
          {error && (
            <p role="alert" style={{ color: COLORS.status.error, fontSize: FONT_SIZES.sm, margin: '10px 0 0' }}>
              {error}
            </p>
          )}
        </>
      )}
    </Modal>
  )
}
