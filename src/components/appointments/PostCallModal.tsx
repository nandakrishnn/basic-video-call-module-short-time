import { useState } from 'react'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { Appointment, AppointmentType } from '@/types/appointment.types'
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
  const dateLabel = new Date(appointment.scheduledAt).toLocaleDateString()
  const whenLabel = new Date(appointment.scheduledAt).toLocaleString()
  const subject = `Your Clinzor Physiotherapy Session — ${dateLabel}`
  const body = `Hi ${patientName},\n\nYour next session with Dr. ${physioName} has been scheduled for ${whenLabel}.\n\nSee you soon!\nClinzor Team`
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,28,107,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div style={{ width: 420, background: COLORS.surface, borderRadius: 16, padding: 28 }}>
        {!created ? (
          <>
            <h2 style={{ color: COLORS.text.primary, fontSize: '1.1rem', fontWeight: 800, marginBottom: 4 }}>
              Schedule next session
            </h2>
            <p style={{ color: COLORS.text.secondary, fontSize: '0.85rem', marginBottom: 16 }}>
              Optional — you can also do this later from the patient profile.
            </p>
            <AppointmentForm onSubmit={(d) => void handleSubmit(d)} isSubmitting={isSubmitting} />
            {error && <p style={{ color: COLORS.status.error, fontSize: '0.82rem', marginTop: 10 }}>{error}</p>}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                marginTop: 12,
                padding: '10px',
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                color: COLORS.text.muted,
                cursor: 'pointer',
              }}
            >
              Skip for now
            </button>
          </>
        ) : (
          <>
            <p style={{ color: COLORS.status.success, fontWeight: 700, marginBottom: 16 }}>
              {MESSAGES.appointments.createSuccess}
            </p>
            {mailtoHref && (
              <a
                href={mailtoHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  borderRadius: 10,
                  background: COLORS.primary,
                  color: COLORS.text.inverse,
                  fontWeight: 700,
                  textDecoration: 'none',
                  marginBottom: 12,
                }}
              >
                {MESSAGES.appointments.shareEmailButton}
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.background,
                color: COLORS.text.primary,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}
