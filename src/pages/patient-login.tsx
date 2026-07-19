import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Logo } from '@/components/shared/Logo'
import { JoinIdentifierStep } from '@/components/video/JoinIdentifierStep'
import { JoinOtpStep } from '@/components/video/JoinOtpStep'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { requestPatientOtpRequest, verifyPatientOtpRequest } from '@/services/auth.service'
import { setToken } from '@/utils/storage'

type Step = 'identifier' | 'otp'

const PatientLoginPage = (): JSX.Element => {
  const router = useRouter()
  const [step, setStep] = useState<Step>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestOtp = async (value: string): Promise<void> => {
    setIdentifier(value)
    setIsSubmitting(true)
    setError(null)
    const res = await requestPatientOtpRequest(value)
    setIsSubmitting(false)
    if (res.success) setStep('otp')
    else setError(res.message)
  }

  const handleVerifyOtp = async (): Promise<void> => {
    setIsSubmitting(true)
    setError(null)
    const res = await verifyPatientOtpRequest(identifier, otp)
    setIsSubmitting(false)
    if (res.success) {
      setToken(res.data.token)
      void router.push(ROUTES.dashboardPatient)
    } else {
      setError(res.message)
    }
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
      <Card elevation="md" style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Logo surface="light" size="lg" />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: COLORS.text.primary, fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              {MESSAGES.patientLogin.title}
            </h1>
            <p style={{ color: COLORS.text.secondary, fontSize: '0.85rem', margin: '6px 0 0', lineHeight: 1.5 }}>
              {MESSAGES.patientLogin.body}
            </p>
          </div>
        </div>

        {step === 'identifier' && (
          <JoinIdentifierStep onSubmit={(v) => void handleRequestOtp(v)} isSubmitting={isSubmitting} />
        )}
        {step === 'otp' && (
          <JoinOtpStep
            otp={otp}
            onOtpChange={setOtp}
            onSubmit={() => void handleVerifyOtp()}
            isSubmitting={isSubmitting}
          />
        )}

        {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

        <p style={{ textAlign: 'center', color: COLORS.text.muted, fontSize: '0.8rem', margin: 0 }}>
          {MESSAGES.patientLogin.physioLinkBody}{' '}
          <Link href={ROUTES.login} style={{ color: COLORS.primaryLight, fontWeight: 600, textDecoration: 'none' }}>
            {MESSAGES.patientLogin.physioLinkLabel}
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default PatientLoginPage
