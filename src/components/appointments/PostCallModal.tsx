import { Check } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { completeAppointmentRequest } from '@/services/appointment.service'

interface PostCallModalProps {
  patientName: string
  /** Booking to close. Omitted for ad-hoc calls with no appointment behind them. */
  appointmentId?: string | null
  token?: string | null
  /** Runs once the physio has answered, either way — leads on to the notes. */
  onDone: () => void
}

/**
 * A single question after a call. The call may have ended because the physio
 * navigated away or dropped connection, not because the consultation finished,
 * so the booking is only closed when they say so. Either answer continues to
 * the write-up — declining to close it is not a reason to lose the notes.
 */
export const PostCallModal = ({
  patientName,
  appointmentId,
  token,
  onDone,
}: PostCallModalProps): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMarkComplete = async (): Promise<void> => {
    // Nothing to close for an ad-hoc call — move straight on.
    if (!appointmentId || !token) {
      onDone()
      return
    }

    setIsSubmitting(true)
    setError(null)
    const res = await completeAppointmentRequest(token, appointmentId)
    setIsSubmitting(false)

    if (res.success) onDone()
    else setError(res.message || MESSAGES.appointments.completeFailed)
  }

  return (
    <Modal
      title={MESSAGES.appointments.completeTitle}
      subtitle={MESSAGES.appointments.completeSubtitle}
      maxWidth={440}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={onDone} style={{ flex: 1 }}>
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
