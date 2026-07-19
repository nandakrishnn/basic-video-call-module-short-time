import { useRouter } from 'next/router'
import { useState } from 'react'
import { AppointmentForm } from '@/components/appointments/AppointmentForm'
import { Card } from '@/components/shared/Card'
import { PageState } from '@/components/shared/PageState'
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
    return <PageState tone="loading" message="Loading…" />
  }

  if (!patientId) {
    return <PageState tone="error" message="No patient selected." />
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.background,
        padding: 20,
      }}
    >
      <Card elevation="md" style={{ width: '100%', maxWidth: 480 }}>
        <h1 style={{ color: COLORS.text.primary, fontSize: '1.25rem', fontWeight: 800, margin: '0 0 20px' }}>
          Schedule appointment
        </h1>
        {success ? (
          <p style={{ color: COLORS.status.success, fontWeight: 700, margin: 0 }}>
            {MESSAGES.appointments.createSuccess}
          </p>
        ) : (
          <>
            <AppointmentForm onSubmit={(d) => void handleSubmit(d)} isSubmitting={isSubmitting} />
            {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem', marginTop: 10 }}>{error}</p>}
          </>
        )}
      </Card>
    </div>
  )
}

export default SchedulePage
