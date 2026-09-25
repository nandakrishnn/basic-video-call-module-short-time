import { Check } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { completeAppointmentRequest } from '@/services/appointment.service'
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
  /** Booking to close. Omitted for ad-hoc calls with no appointment behind them. */
  appointmentId?: string | null
  token?: string | null
  onSchedule: (data: ScheduleData) => Promise<Appointment | null>
  onClose: () => void
}

/**
 * 'confirm' first, deliberately. The call may have ended because the physio
 * navigated away or dropped connection, not because the consultation finished —
 * so the booking is only closed when they say so here. Leaving without
 * confirming keeps it scheduled and rejoinable.
 */
type Step = 'confirm' | 'schedule' | 'done'

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
  appointmentId,
  token,
  onSchedule,
  onClose,
}: PostCallModalProps): JSX.Element => {
  const [step, setStep] = useState<Step>('confirm')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [created, setCreated] = useState<Appointment | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMarkComplete = async (): Promise<void> => {
    // Nothing to close for an ad-hoc call — move straight on.
    if (!appointmentId || !token) {
      setStep('schedule')
      return
    }

    setIsSubmitting(true)
    setError(null)
    const res = await completeAppointmentRequest(token, appointmentId)
    setIsSubmitting(false)

    if (res.success) setStep('schedule')
    else setError(res.message || MESSAGES.appointments.completeFailed)
  }

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
  if (step === 'confirm') {
    return (
      <Modal
        title={MESSAGES.appointments.completeTitle}
        subtitle={MESSAGES.appointments.completeSubtitle}
        maxWidth={440}
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
              {MESSAGES.appointments.completeNotYet}
            </Button>
            <Button
              variant="primary"
              isLoading={isSubmitting}
              onClick={() => void handleMarkComplete()}
              style={{ flex: 2 }}
            >
              <Check size={16} />
              {MESSAGES.appointments.completeAction}
            </Button>
          </div>
        }
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 15px',
            borderRadius: RADII.md,
            background: COLORS.primarySofter,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Avatar name={patientName} size={40} />
          <div style={{ minWidth: 0 }}>
            <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: FONT_SIZES.base, margin: 0 }}>
              {patientName}
            </p>
            <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '2px 0 0' }}>
              {MESSAGES.appointments.completeEnded}
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" style={{ color: COLORS.status.error, fontSize: FONT_SIZES.base, margin: '14px 0 0' }}>
            {error}
          </p>
        )}
      </Modal>
    )
  }

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
