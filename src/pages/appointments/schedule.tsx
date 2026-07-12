import { useRouter } from 'next/router'
import { useState } from 'react'
import { AppointmentForm } from '@/components/appointments/AppointmentForm'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { useAuth } from '@/hooks/useAuth'
import { createAppointmentRequest } from '@/services/appointment.service'
import type { AppointmentType } from '@/types/appointment.types'
import { getToken } from '@/utils/storage'

const SchedulePage = (): JSX.Element => {
  const router = useRouter()
  const { patientId } = router.query as { patientId?: string }
  const { isLoading: isAuthLoading } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: {
    scheduledAt: string
    sessionType: AppointmentType
    internalNote?: string
  }): Promise<void> => {
    const token = getToken()
    if (!token || !patientId) return

    setIsSubmitting(true)
    setError(null)
    const res = await createAppointmentRequest(token, { patientId, ...data })
    setIsSubmitting(false)

    if (res.success) setSuccess(true)
    else setError(res.message)
  }

  if (isAuthLoading) {
    return <div style={{ padding: 40, color: COLORS.text.secondary }}>Loading…</div>
  }

  if (!patientId) {
    return <div style={{ padding: 40, color: COLORS.status.error }}>No patient selected.</div>
  }

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: 32, background: COLORS.surface, borderRadius: 16 }}>
      <h1 style={{ color: COLORS.text.primary, fontSize: '1.2rem', fontWeight: 800, marginBottom: 20 }}>
        Schedule appointment
      </h1>
      {success ? (
        <p style={{ color: COLORS.status.success, fontWeight: 700 }}>{MESSAGES.appointments.createSuccess}</p>
      ) : (
        <>
          <AppointmentForm onSubmit={(d) => void handleSubmit(d)} isSubmitting={isSubmitting} />
          {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem', marginTop: 10 }}>{error}</p>}
        </>
      )}
    </div>
  )
}

export default SchedulePage
